import { Component, computed, inject, output, signal } from '@angular/core';
import { Entry, Status, VocabStore, MASTERY_STREAK, statusOf } from './vocab-store';

type SortKey = 'newest' | 'alpha' | 'weakest';

/** The notebook column: every word you have written down, as dictionary entries. */
@Component({
  selector: 'app-library',
  templateUrl: './library.html',
})
export class Library {
  private readonly store = inject(VocabStore);

  readonly edit = output<Entry>();
  readonly create = output<void>();

  protected readonly masteryStreak = MASTERY_STREAK;
  protected readonly pips = Array.from({ length: MASTERY_STREAK }, (_, i) => i);
  protected readonly statuses: Array<Status | 'all'> = ['all', 'new', 'learning', 'known'];

  protected readonly query = signal('');
  protected readonly status = signal<Status | 'all'>('all');
  protected readonly tag = signal<string | null>(null);
  protected readonly sort = signal<SortKey>('newest');
  protected readonly pendingDelete = signal<string | null>(null);

  protected readonly tags = this.store.tags;
  protected readonly total = computed(() => this.store.counts().total);

  protected readonly visible = computed<Entry[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const status = this.status();
    const tag = this.tag();

    const filtered = this.store.entries().filter((entry) => {
      if (status !== 'all' && statusOf(entry) !== status) return false;
      if (tag && !entry.tags.includes(tag)) return false;
      if (!needle) return true;
      return (
        entry.word.toLowerCase().includes(needle) ||
        entry.meaning.toLowerCase().includes(needle) ||
        entry.example.toLowerCase().includes(needle) ||
        entry.tags.some((t) => t.toLowerCase().includes(needle))
      );
    });

    switch (this.sort()) {
      case 'alpha':
        return filtered.sort((a, b) => a.word.localeCompare(b.word));
      case 'weakest':
        return filtered.sort((a, b) => a.streak - b.streak || a.attempts - b.attempts);
      default:
        return filtered;
    }
  });

  protected statusOf(entry: Entry): Status {
    return statusOf(entry);
  }

  /** Filter names people recognise, rather than the status values we store. */
  protected statusLabel(option: Status | 'all'): string {
    switch (option) {
      case 'all':
        return 'All';
      case 'new':
        return 'Not drilled';
      case 'learning':
        return 'Learning';
      case 'known':
        return 'Memorized';
    }
  }

  protected toggleTag(tag: string): void {
    this.tag.update((current) => (current === tag ? null : tag));
  }

  protected accuracy(entry: Entry): string {
    if (entry.attempts === 0) return 'Not drilled yet';
    return `Written correctly ${entry.correct} of ${entry.attempts} times`;
  }

  protected confirmDelete(entry: Entry): void {
    if (this.pendingDelete() === entry.id) {
      this.store.remove(entry.id);
      this.pendingDelete.set(null);
    } else {
      this.pendingDelete.set(entry.id);
    }
  }

  protected resetProgress(entry: Entry): void {
    this.store.resetProgress(entry.id);
  }

  protected setStatus(entry: Entry, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as Status;
    this.store.setStatus(entry.id, status);
  }

  protected setQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected setSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as SortKey);
  }
}
