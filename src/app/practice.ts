import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { Entry, VocabStore, normalize, statusOf } from './vocab-store';

type Phase = 'idle' | 'writing' | 'checked' | 'done';
type Scope = 'unmastered' | 'all';

const ROUND_SIZE = 20;

/** The writing drill: meaning on screen, word out of your own head. */
@Component({
  selector: 'app-practice',
  templateUrl: './practice.html',
})
export class Practice {
  private readonly store = inject(VocabStore);
  private readonly answerInput = viewChild<ElementRef<HTMLInputElement>>('answer');

  protected readonly roundSize = ROUND_SIZE;
  protected readonly phase = signal<Phase>('idle');
  protected readonly scope = signal<Scope>('unmastered');
  protected readonly showHint = signal(false);

  private readonly queue = signal<Entry[]>([]);
  protected readonly position = signal(0);
  protected readonly typed = signal('');
  protected readonly wasCorrect = signal(false);
  protected readonly right = signal(0);
  protected readonly wrong = signal(0);

  protected readonly counts = this.store.counts;

  protected readonly pool = computed(() =>
    this.scope() === 'all'
      ? this.store.entries()
      : this.store.entries().filter((entry) => statusOf(entry) !== 'known'),
  );

  protected readonly current = computed<Entry | null>(() => this.queue()[this.position()] ?? null);
  protected readonly total = computed(() => this.queue().length);
  protected readonly done = computed(() => this.right() + this.wrong());
  protected readonly percent = computed(() =>
    this.total() === 0 ? 0 : Math.round((this.position() / this.total()) * 100),
  );

  /** The example sentence with the answer struck out, so it hints without telling. */
  protected readonly maskedExample = computed(() => {
    const entry = this.current();
    if (!entry?.example) return null;
    const pattern = new RegExp(escapeRegExp(entry.word), 'gi');
    return entry.example.replace(pattern, '———');
  });

  protected start(): void {
    const picked = pickRound(this.pool(), ROUND_SIZE);
    if (picked.length === 0) return;
    this.queue.set(picked);
    this.position.set(0);
    this.right.set(0);
    this.wrong.set(0);
    this.typed.set('');
    this.phase.set('writing');
    queueMicrotask(() => this.answerInput()?.nativeElement.focus());
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.phase() === 'writing') this.check();
    else if (this.phase() === 'checked') this.next();
  }

  private check(): void {
    const entry = this.current();
    if (!entry) return;
    const correct = normalize(this.typed()) === normalize(entry.word) && this.typed().trim() !== '';
    this.wasCorrect.set(correct);
    if (correct) this.right.update((n) => n + 1);
    else this.wrong.update((n) => n + 1);
    this.store.grade(entry.id, correct);
    this.phase.set('checked');
  }

  private next(): void {
    const entry = this.current();
    // A missed word comes back around before the round is over.
    if (entry && !this.wasCorrect()) {
      this.queue.update((list) => [...list, entry]);
    }
    const at = this.position() + 1;
    this.typed.set('');
    if (at >= this.queue().length) {
      this.phase.set('done');
      return;
    }
    this.position.set(at);
    this.phase.set('writing');
    queueMicrotask(() => this.answerInput()?.nativeElement.focus());
  }

  protected quit(): void {
    this.phase.set(this.done() > 0 ? 'done' : 'idle');
  }

  protected restart(): void {
    this.phase.set('idle');
  }

  protected setTyped(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Weakest and least-recently-seen words first, shuffled inside each streak tier. */
function pickRound(pool: Entry[], size: number): Entry[] {
  const tiers = new Map<number, Entry[]>();
  for (const entry of pool) {
    const tier = tiers.get(entry.streak) ?? [];
    tier.push(entry);
    tiers.set(entry.streak, tier);
  }
  const ordered: Entry[] = [];
  for (const streak of [...tiers.keys()].sort((a, b) => a - b)) {
    ordered.push(...shuffle(tiers.get(streak)!));
  }
  return ordered.slice(0, size);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
