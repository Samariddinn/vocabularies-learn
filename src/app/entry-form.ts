import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Dictionary, Lookup, PARTS_OF_SPEECH } from './dictionary';
import { SpeakButton } from './speak-button';
import { Entry, VocabStore } from './vocab-store';

/** How long typing has to pause before the word is looked up. */
const LOOKUP_DELAY_MS = 600;

/** The compose slip: one word in, one word out. Doubles as the edit form. */
@Component({
  selector: 'app-entry-form',
  imports: [SpeakButton],
  templateUrl: './entry-form.html',
})
export class EntryForm {
  private readonly store = inject(VocabStore);
  private readonly dictionary = inject(Dictionary);

  readonly editing = input<Entry | null>(null);
  readonly done = output<void>();
  /** Emits the word after a new entry is saved, so the shell can confirm it. */
  readonly added = output<string>();

  private readonly wordInput = viewChild<ElementRef<HTMLInputElement>>('wordInput');

  protected readonly word = signal('');
  protected readonly reading = signal('');
  protected readonly pos = signal('');
  protected readonly meaning = signal('');
  protected readonly example = signal('');
  protected readonly collocations = signal('');
  protected readonly tags = signal('');
  protected readonly problem = signal<string | null>(null);

  protected readonly partsOfSpeech = PARTS_OF_SPEECH;
  protected readonly lookup = signal<Lookup | null>(null);
  protected readonly lookupState = signal<'idle' | 'loading' | 'missing' | 'offline'>('idle');

  /** Dictionary definitions for the chosen part of speech, offered while the meaning is blank. */
  protected readonly suggestedMeanings = computed(() => {
    const senses = this.lookup()?.senses ?? [];
    const pos = this.pos();
    const matching = senses.filter((sense) => sense.pos === pos);
    return (matching.length ? matching : senses).slice(0, 3);
  });

  /** Offered as one-tap choices when the dictionary lists more than one part of speech. */
  protected readonly posChoices = computed(() => {
    const parts = this.lookup()?.parts ?? [];
    return parts.length > 1 ? parts : [];
  });

  private lookupTimer: ReturnType<typeof setTimeout> | undefined;
  private lookedUp = '';
  /** What the lookup filled in, so a later lookup may replace it but never the user's own text. */
  private autofilled: { pos?: string; reading?: string } = {};

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.lookupTimer));

    effect(() => {
      const entry = this.editing();
      if (!entry) return;
      this.word.set(entry.word);
      this.reading.set(entry.reading);
      this.pos.set(entry.pos);
      this.meaning.set(entry.meaning);
      this.example.set(entry.example);
      this.collocations.set((entry.collocations ?? []).join('\n'));
      this.tags.set(entry.tags.join(', '));
      this.problem.set(null);
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

  protected onWordInput(event: Event): void {
    this.word.set(this.value(event));
    clearTimeout(this.lookupTimer);
    this.lookupTimer = setTimeout(() => this.lookUp(), LOOKUP_DELAY_MS);
  }

  /** Runs on pause and on leaving the field; only fills fields that are empty or were filled by it. */
  protected async lookUp(): Promise<void> {
    clearTimeout(this.lookupTimer);
    const word = this.word().trim();
    if (word === this.lookedUp) return;
    this.lookedUp = word;
    this.dropAutofill();
    this.lookup.set(null);
    if (!word) {
      this.lookupState.set('idle');
      return;
    }

    this.lookupState.set('loading');
    let result: Lookup | null;
    try {
      result = await this.dictionary.lookup(word);
    } catch {
      if (this.lookedUp === word) {
        this.lookupState.set('offline');
        this.lookedUp = '';
      }
      return;
    }
    // The word changed while the request was out.
    if (this.lookedUp !== word) return;

    this.lookup.set(result);
    this.lookupState.set(result ? 'idle' : 'missing');
    if (!result) return;

    if (result.parts.length === 1 && !this.pos()) {
      this.pos.set(result.parts[0]);
      this.autofilled.pos = result.parts[0];
    }
    if (result.reading && !this.reading()) {
      this.reading.set(result.reading);
      this.autofilled.reading = result.reading;
    }
  }

  protected setPos(pos: string): void {
    this.pos.set(pos);
    this.autofilled.pos = undefined;
  }

  protected setReading(reading: string): void {
    this.reading.set(reading);
    this.autofilled.reading = undefined;
  }

  /** Clears what the last lookup filled in, unless the user has since changed it. */
  private dropAutofill(): void {
    if (this.autofilled.pos && this.pos() === this.autofilled.pos) this.pos.set('');
    if (this.autofilled.reading && this.reading() === this.autofilled.reading) this.reading.set('');
    this.autofilled = {};
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
      collocations: this.collocations()
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
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
    this.added.emit(word);
    this.done.emit();
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
    this.collocations.set('');
    this.tags.set('');
    this.problem.set(null);
    clearTimeout(this.lookupTimer);
    this.lookedUp = '';
    this.autofilled = {};
    this.lookup.set(null);
    this.lookupState.set('idle');
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }
}
