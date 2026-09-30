import { Component, ElementRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { SpeakButton } from './speak-button';
import { Speech } from './speech';
import { Entry, MASTERY_STREAK, Status, VocabStore, statusOf } from './vocab-store';

type Phase = 'idle' | 'reading' | 'done';
type Scope = Status | 'all';
type Order = 'added' | 'shuffled';

/** A read-through of the notebook: one word at a time, everything you saved about it, read aloud. */
@Component({
  selector: 'app-review',
  imports: [SpeakButton],
  templateUrl: './review.html',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class Review implements OnDestroy {
  private readonly store = inject(VocabStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly speech = inject(Speech);

  protected readonly masteryStreak = MASTERY_STREAK;
  protected readonly phase = signal<Phase>('idle');
  // Coming back to go over memorized words is the point, so start there when there are any.
  protected readonly scope = signal<Scope>(this.store.counts().known > 0 ? 'known' : 'all');
  protected readonly order = signal<Order>('added');
  protected readonly aloud = signal(true);

  private readonly queue = signal<Entry[]>([]);
  protected readonly position = signal(0);

  protected readonly counts = this.store.counts;

  protected readonly pool = computed(() => {
    const scope = this.scope();
    const all = this.store.entries();
    return scope === 'all' ? all : all.filter((entry) => statusOf(entry) === scope);
  });

  protected readonly current = computed<Entry | null>(() => this.queue()[this.position()] ?? null);
  protected readonly total = computed(() => this.queue().length);
  protected readonly percent = computed(() =>
    this.total() === 0 ? 0 : Math.round(((this.position() + 1) / this.total()) * 100),
  );

  protected start(): void {
    // entries() is newest first; the order added reads oldest first, like the notebook's pages.
    const picked = this.order() === 'shuffled' ? shuffle(this.pool()) : [...this.pool()].reverse();
    if (picked.length === 0) return;
    this.queue.set(picked);
    this.position.set(0);
    this.phase.set('reading');
    this.readCurrent();
  }

  protected next(): void {
    const at = this.position() + 1;
    if (at >= this.queue().length) {
      this.finish();
      return;
    }
    this.position.set(at);
    this.readCurrent();
  }

  protected previous(): void {
    if (this.position() === 0) return;
    this.position.update((n) => n - 1);
    this.readCurrent();
  }

  protected finish(): void {
    this.speech.stop();
    this.phase.set('done');
  }

  protected restart(): void {
    this.phase.set('idle');
  }

  /** Reads the card from the top. While it is still reading, the same action stops it. */
  protected readAgain(): void {
    const entry = this.current();
    if (entry) this.speech.speak(readAloud(entry));
  }

  protected readingNow(entry: Entry): boolean {
    return this.speech.speaking() === readAloud(entry);
  }

  private readCurrent(): void {
    const entry = this.current();
    if (!entry) return;
    if (this.aloud()) this.speech.say(readAloud(entry));
    else this.speech.stop();
  }

  protected statusLabel(entry: Entry): string {
    switch (statusOf(entry)) {
      case 'known':
        return 'Memorized';
      case 'learning':
        return `Learning, ${entry.streak} of ${MASTERY_STREAK} in a row`;
      case 'new':
        return 'Not drilled yet';
    }
  }

  /**
   * Enter moves on (and starts or restarts from the other screens), arrows step back and
   * forth, Space reads the card again. Fields, links, the open add-word dialog and buttons
   * outside the review keep their own keys. While reading, the review's own buttons don't:
   * after clicking Back, Enter should still mean "next", not press Back again.
   */
  protected onKey(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    if (document.querySelector('dialog[open]')) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, select, textarea, a, [contenteditable]')) return;
    const button = target?.closest('button');
    if (button && !(this.phase() === 'reading' && this.host.nativeElement.contains(button))) return;

    const phase = this.phase();
    const key = event.key;
    if (phase === 'reading') {
      if (key === 'Enter' || key === 'ArrowRight') this.next();
      else if (key === 'ArrowLeft') this.previous();
      else if (key === ' ') this.readAgain();
      else if (key === 'Escape') this.finish();
      else return;
    } else if (key === 'Enter') {
      if (phase === 'idle') this.start();
      else this.restart();
    } else {
      return;
    }
    event.preventDefault();
  }

  ngOnDestroy(): void {
    // Switching tabs shouldn't leave a card being read to an empty screen.
    if (this.phase() === 'reading') this.speech.stop();
  }
}

/**
 * The card as one passage to speak, with full stops so the voice pauses between parts:
 * "threshold. noun. The point where something starts. For example: … Goes with: cross the
 * threshold, pain threshold."
 */
export function readAloud(entry: Entry): string {
  const parts = [entry.word, entry.pos, entry.meaning];
  if (entry.example.trim()) parts.push(`For example: ${entry.example}`);
  if (entry.collocations?.length) parts.push(`Goes with: ${entry.collocations.join(', ')}`);
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (/[.!?]$/.test(part) ? part : `${part}.`))
    .join(' ');
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
