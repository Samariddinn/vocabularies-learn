import { Component, computed, inject, input } from '@angular/core';
import { Speech } from './speech';

/** A speaker icon that reads `text` aloud. Renders nothing where the browser can't speak. */
@Component({
  selector: 'app-speak-button',
  template: `
    @if (speech.supported) {
      <button
        type="button"
        class="speak"
        [disabled]="!text().trim()"
        [attr.aria-label]="(playing() ? 'Stop reading ' : 'Listen to ') + text()"
        [attr.aria-pressed]="playing()"
        [attr.title]="playing() ? 'Stop' : 'Listen'"
        (click)="speech.speak(text()); $event.stopPropagation()"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
          <path
            d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </button>
    }
  `,
})
export class SpeakButton {
  protected readonly speech = inject(Speech);
  readonly text = input.required<string>();
  protected readonly playing = computed(() => this.speech.speaking() === this.text().trim());
}
