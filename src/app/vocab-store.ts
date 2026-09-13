import { Injectable, computed, signal } from '@angular/core';

export interface Entry {
  id: string;
  word: string;
  reading: string;
  pos: string;
  meaning: string;
  example: string;
  tags: string[];
  createdAt: number;
  reviewedAt: number | null;
  /** Consecutive correct written recalls. */
  streak: number;
  attempts: number;
  correct: number;
}

export type Status = 'new' | 'learning' | 'known';

export type EntryDraft = Pick<Entry, 'word' | 'reading' | 'pos' | 'meaning' | 'example' | 'tags'>;

/** Consecutive correct spellings before a word counts as memorized. */
export const MASTERY_STREAK = 5;

const DB_NAME = 'vocab-notebook';
const DB_VERSION = 1;
const STORE = 'entries';

export function statusOf(entry: Entry): Status {
  if (entry.streak >= MASTERY_STREAK) return 'known';
  if (entry.attempts > 0) return 'learning';
  return 'new';
}

/** Loose match so capitalisation, stray spaces and a trailing full stop still count. */
export function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.!?,;:]+$/, '');
}

const STARTER_WORDS: EntryDraft[] = [];

/**
 * Everything lives in IndexedDB on this machine. The signal below is the working
 * copy the UI renders; every mutation writes through to disk.
 */
@Injectable({ providedIn: 'root' })
export class VocabStore {
  private db: IDBDatabase | null = null;
  private readonly all = signal<Entry[]>([]);

  readonly entries = computed(() =>
    [...this.all()].sort((a, b) => b.createdAt - a.createdAt),
  );
  readonly ready = signal(false);
  readonly storageError = signal<string | null>(null);

  readonly counts = computed(() => {
    const tally = { total: 0, new: 0, learning: 0, known: 0 };
    for (const entry of this.all()) {
      tally.total++;
      tally[statusOf(entry)]++;
    }
    return tally;
  });

  readonly tags = computed(() => {
    const seen = new Map<string, number>();
    for (const entry of this.all()) {
      for (const tag of entry.tags) seen.set(tag, (seen.get(tag) ?? 0) + 1);
    }
    return [...seen.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  });

  constructor() {
    this.open();
  }

  private async open(): Promise<void> {
    if (typeof indexedDB === 'undefined') {
      this.storageError.set('This browser has no IndexedDB, so nothing will be saved.');
      this.ready.set(true);
      return;
    }
    try {
      this.db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: 'id' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const stored = await this.readAll();
      if (stored.length === 0) {
        const seeded = STARTER_WORDS.map((draft) => this.build(draft));
        await Promise.all(seeded.map((entry) => this.put(entry)));
        this.all.set(seeded);
      } else {
        this.all.set(stored);
      }
    } catch (error) {
      this.storageError.set(
        `Could not open the local database (${describe(error)}). Changes will be lost when you close the tab.`,
      );
    } finally {
      this.ready.set(true);
    }
  }

  private readAll(): Promise<Entry[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const request = this.db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result as Entry[]);
      request.onerror = () => reject(request.error);
    });
  }

  private put(entry: Entry): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const request = this.db.transaction(STORE, 'readwrite').objectStore(STORE).put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private drop(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const request = this.db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private build(draft: EntryDraft): Entry {
    return {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      reviewedAt: null,
      streak: 0,
      attempts: 0,
      correct: 0,
    };
  }

  /** Returns the existing entry when the word is already in the notebook. */
  findByWord(word: string): Entry | undefined {
    const needle = normalize(word);
    return this.all().find((entry) => normalize(entry.word) === needle);
  }

  async add(draft: EntryDraft): Promise<Entry> {
    const entry = this.build(draft);
    this.all.update((list) => [...list, entry]);
    await this.save(entry);
    return entry;
  }

  async update(id: string, patch: Partial<Entry>): Promise<void> {
    const next = this.all().map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
    this.all.set(next);
    const changed = next.find((entry) => entry.id === id);
    if (changed) await this.save(changed);
  }

  async remove(id: string): Promise<void> {
    this.all.update((list) => list.filter((entry) => entry.id !== id));
    try {
      await this.drop(id);
    } catch (error) {
      this.storageError.set(`Could not delete from storage (${describe(error)}).`);
    }
  }

  /** Records one written attempt and moves the word along its streak. */
  async grade(id: string, wasCorrect: boolean): Promise<void> {
    const entry = this.all().find((item) => item.id === id);
    if (!entry) return;
    await this.update(id, {
      attempts: entry.attempts + 1,
      correct: entry.correct + (wasCorrect ? 1 : 0),
      streak: wasCorrect ? entry.streak + 1 : 0,
      reviewedAt: Date.now(),
    });
  }

  async resetProgress(id: string): Promise<void> {
    await this.update(id, { streak: 0, attempts: 0, correct: 0, reviewedAt: null });
  }

  /** Lets a word's status be set by hand instead of only earned through drilling. */
  async setStatus(id: string, status: Status): Promise<void> {
    const entry = this.all().find((item) => item.id === id);
    if (!entry) return;
    switch (status) {
      case 'known':
        // Streak at the mastery line is what "known" means — keep whatever
        // attempt history the word already has.
        await this.update(id, {
          streak: Math.max(entry.streak, MASTERY_STREAK),
          attempts: Math.max(entry.attempts, MASTERY_STREAK),
          correct: Math.max(entry.correct, MASTERY_STREAK),
          reviewedAt: Date.now(),
        });
        return;
      case 'learning':
        // Below mastery but with at least one attempt on record.
        await this.update(id, {
          streak: 0,
          attempts: Math.max(entry.attempts, 1),
          reviewedAt: Date.now(),
        });
        return;
      case 'new':
        await this.resetProgress(id);
        return;
    }
  }

  exportJson(): string {
    return JSON.stringify({ app: 'vocab-notebook', version: 1, entries: this.entries() }, null, 2);
  }

  /** Merges a backup in by word; returns how many were added and how many already existed. */
  async importJson(raw: string): Promise<{ added: number; skipped: number }> {
    const parsed: unknown = JSON.parse(raw);
    const incoming = Array.isArray(parsed)
      ? parsed
      : (parsed as { entries?: unknown })?.entries;
    if (!Array.isArray(incoming)) throw new Error('no entries array in that file');

    let added = 0;
    let skipped = 0;
    for (const candidate of incoming as Partial<Entry>[]) {
      if (!candidate?.word || typeof candidate.word !== 'string') continue;
      if (this.findByWord(candidate.word)) {
        skipped++;
        continue;
      }
      const entry: Entry = {
        id: typeof candidate.id === 'string' ? candidate.id : crypto.randomUUID(),
        word: candidate.word,
        reading: candidate.reading ?? '',
        pos: candidate.pos ?? '',
        meaning: candidate.meaning ?? '',
        example: candidate.example ?? '',
        tags: Array.isArray(candidate.tags) ? candidate.tags.filter((t) => typeof t === 'string') : [],
        createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : Date.now(),
        reviewedAt: typeof candidate.reviewedAt === 'number' ? candidate.reviewedAt : null,
        streak: typeof candidate.streak === 'number' ? candidate.streak : 0,
        attempts: typeof candidate.attempts === 'number' ? candidate.attempts : 0,
        correct: typeof candidate.correct === 'number' ? candidate.correct : 0,
      };
      this.all.update((list) => [...list, entry]);
      await this.save(entry);
      added++;
    }
    return { added, skipped };
  }

  private async save(entry: Entry): Promise<void> {
    try {
      await this.put(entry);
      this.storageError.set(null);
    } catch (error) {
      this.storageError.set(`Could not save "${entry.word}" (${describe(error)}).`);
    }
  }
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'name' in error) return String(error.name);
  return 'unknown error';
}
