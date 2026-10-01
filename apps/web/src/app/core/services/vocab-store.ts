import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Vocabulary, VocabulariesApi, toCreateRequest } from './vocabularies-api';

export interface Entry {
  id: string;
  word: string;
  reading: string;
  pos: string;
  meaning: string;
  example: string;
  /** Word partnerships worth learning with it ("cross the threshold"). Optional. */
  collocations: string[];
  tags: string[];
  createdAt: number;
  reviewedAt: number | null;
  /** Consecutive correct written recalls. */
  streak: number;
  attempts: number;
  correct: number;
}

export type Status = 'new' | 'learning' | 'known';

export type EntryDraft = Pick<Entry, 'word' | 'reading' | 'pos' | 'meaning' | 'example' | 'collocations' | 'tags'>;

/** Consecutive correct spellings before a word counts as memorized. */
export const MASTERY_STREAK = 5;

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

/**
 * The logged-in user's words. The server (GET /vocabularies) is the only source:
 * the list is loaded from it and nothing is kept in the browser's storage.
 *
 * Adding a word goes through the API first. Edits, deletes and drill progress
 * only change this in-memory copy until the backend has endpoints for them —
 * they are lost on reload.
 */
@Injectable({ providedIn: 'root' })
export class VocabStore {
  private readonly api = inject(VocabulariesApi);
  private readonly all = signal<Entry[]>([]);

  readonly entries = computed(() =>
    [...this.all()].sort((a, b) => b.createdAt - a.createdAt),
  );
  /** False while the list is being loaded from the server. */
  readonly ready = signal(false);
  /** Set when the server couldn't be reached or refused the request. */
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

  /** Loads the user's words from the server, replacing whatever was shown before. */
  async load(): Promise<void> {
    this.ready.set(false);
    try {
      const words = await firstValueFrom(this.api.list());
      this.all.set(words.map(fromServer));
      this.storageError.set(null);
    } catch {
      // 401 is handled by the auth interceptor (logs out → /login).
      this.all.set([]);
      this.storageError.set("Couldn't load your words from the server. Check that the API is running, then reload.");
    } finally {
      this.ready.set(true);
    }
  }

  /** Forgets the list — call on logout so the next user doesn't see it. */
  clear(): void {
    this.all.set([]);
    this.ready.set(false);
    this.storageError.set(null);
  }

  /** Returns the existing entry when the word is already in the notebook. */
  findByWord(word: string): Entry | undefined {
    const needle = normalize(word);
    return this.all().find((entry) => normalize(entry.word) === needle);
  }

  /** Adds a word the server has just saved (the response of POST /vocabularies/create). */
  addFromServer(word: Vocabulary): Entry {
    const entry = fromServer(word);
    this.all.update((list) => [...list, entry]);
    return entry;
  }

  // ---- in-memory only until the backend has PATCH / DELETE / practice endpoints ----

  async update(id: string, patch: Partial<Entry>): Promise<void> {
    this.all.update((list) => list.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  }

  async remove(id: string): Promise<void> {
    this.all.update((list) => list.filter((entry) => entry.id !== id));
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

  /**
   * Imports a backup file by sending each new word to the server.
   * Words already in the notebook (or rejected by the server) are skipped.
   */
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
      if (!candidate.meaning || this.findByWord(candidate.word)) {
        skipped++;
        continue;
      }
      const draft: EntryDraft = {
        word: candidate.word.trim(),
        meaning: candidate.meaning,
        reading: candidate.reading ?? '',
        pos: candidate.pos ?? '',
        example: candidate.example ?? '',
        collocations: Array.isArray(candidate.collocations)
          ? candidate.collocations.filter((c) => typeof c === 'string')
          : [],
        tags: [],
      };
      try {
        this.addFromServer(await firstValueFrom(this.api.create(toCreateRequest(draft))));
        added++;
      } catch {
        skipped++; // duplicate on the server, invalid field, …
      }
    }
    return { added, skipped };
  }
}

/** Converts a row from the API into the notebook's Entry shape. */
function fromServer(word: Vocabulary): Entry {
  return {
    id: word.id,
    word: word.word,
    reading: word.pronunciation ?? '',
    pos: word.part_of_speech ?? '',
    meaning: word.meaning,
    example: word.sentences ?? '',
    collocations: (word.collocations ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    tags: [],
    createdAt: Date.parse(word.created_at) || Date.now(),
    reviewedAt: word.reviewed_at ? Date.parse(word.reviewed_at) : null,
    streak: word.streak,
    attempts: word.attempts,
    correct: word.correct,
  };
}
