import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { EntryForm } from './entry-form';
import { Library } from './library';
import { Practice } from './practice';
import { Entry, VocabStore } from './vocab-store';

type Tab = 'notebook' | 'drill';
type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'vocab-theme';

@Component({
  imports: [EntryForm, Library, Practice],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly store = inject(VocabStore);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('composerDialog');
  private readonly form = viewChild(EntryForm);

  protected readonly tab = signal<Tab>('notebook');
  protected readonly editing = signal<Entry | null>(null);
  protected readonly expanded = signal(false);
  protected readonly theme = signal<Theme>(readTheme());
  protected readonly message = signal<string | null>(null);

  protected openComposer(): void {
    this.editing.set(null);
    this.form()?.clear();
    this.dialog()?.nativeElement.showModal();
    queueMicrotask(() => this.form()?.focusWord());
  }

  protected startEdit(entry: Entry): void {
    this.editing.set(entry);
    this.dialog()?.nativeElement.showModal();
  }

  protected closeComposer(): void {
    this.dialog()?.nativeElement.close();
  }

  /** Native <dialog> puts the backdrop on the element itself, so an outside click lands here. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) this.closeComposer();
  }

  protected onDialogClose(): void {
    this.editing.set(null);
  }

  protected cycleTheme(): void {
    const order: Theme[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(this.theme()) + 1) % order.length];
    this.theme.set(next);
    if (next === 'system') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem(THEME_KEY);
    } else {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
    }
  }

  protected exportBackup(): void {
    const blob = new Blob([this.store.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vocab-notebook-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.flash(`Saved ${this.store.counts().total} words to a file.`);
  }

  protected async importBackup(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const { added, skipped } = await this.store.importJson(await file.text());
      this.flash(
        `Added ${added} word${added === 1 ? '' : 's'}` +
          (skipped ? `, skipped ${skipped} already in the notebook.` : '.'),
      );
    } catch (error) {
      this.flash(`Could not read that file: ${error instanceof Error ? error.message : 'bad JSON'}.`);
    }
  }

  private flash(text: string): void {
    this.message.set(text);
    setTimeout(() => this.message.set(null), 5000);
  }
}

function readTheme(): Theme {
  const stored = typeof localStorage === 'undefined' ? null : localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}
