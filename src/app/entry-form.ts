import { Component, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { Entry, VocabStore } from './vocab-store';

/** The compose slip: one word in, one word out. Doubles as the edit form. */
@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.html',
})
export class EntryForm {
  private readonly store = inject(VocabStore);

  readonly editing = input<Entry | null>(null);
  readonly done = output<void>();

  private readonly wordInput = viewChild<ElementRef<HTMLInputElement>>('wordInput');

  protected readonly word = signal('');
  protected readonly reading = signal('');
  protected readonly pos = signal('');
  protected readonly meaning = signal('');
  protected readonly example = signal('');
  protected readonly tags = signal('');
  protected readonly problem = signal<string | null>(null);
  protected readonly justAdded = signal<string | null>(null);

  constructor() {
    effect(() => {
      const entry = this.editing();
      if (!entry) return;
      this.word.set(entry.word);
      this.reading.set(entry.reading);
      this.pos.set(entry.pos);
      this.meaning.set(entry.meaning);
      this.example.set(entry.example);
      this.tags.set(entry.tags.join(', '));
      this.problem.set(null);
      this.justAdded.set(null);
      this.wordInput()?.nativeElement.focus();
    });
  }

  /** Called by the shell when the dialog opens for a brand new word. */
  clear(): void {
    this.reset();
  }

  focusWord(): void {
    this.wordInput()?.nativeElement.focus();
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    const word = this.word().trim();
    const meaning = this.meaning().trim();
    if (!word) {
      this.problem.set('Type the word first.');
      return;
    }
    if (!meaning) {
      this.problem.set('Add what it means — that is the side the drill shows you.');
      return;
    }

    const draft = {
      word,
      meaning,
      reading: this.reading().trim(),
      pos: this.pos().trim(),
      example: this.example().trim(),
      tags: this.tags()
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const editing = this.editing();
    if (editing) {
      await this.store.update(editing.id, draft);
      this.reset();
      this.done.emit();
      return;
    }

    const clash = this.store.findByWord(word);
    if (clash) {
      this.problem.set(`"${clash.word}" is already in the notebook.`);
      return;
    }

    await this.store.add(draft);
    this.reset();
    this.justAdded.set(word);
    this.wordInput()?.nativeElement.focus();
  }

  protected cancel(): void {
    this.reset();
    this.done.emit();
  }

  private reset(): void {
    this.word.set('');
    this.reading.set('');
    this.pos.set('');
    this.meaning.set('');
    this.example.set('');
    this.tags.set('');
    this.problem.set(null);
    this.justAdded.set(null);
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }
}
