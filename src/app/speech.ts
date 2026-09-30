import { Injectable, signal } from '@angular/core';

/**
 * Reads words aloud with the browser's own text-to-speech, so it works offline and
 * for whole phrases. Voices arrive asynchronously in some browsers (Chrome), hence
 * the voiceschanged listener.
 */
@Injectable({ providedIn: 'root' })
export class Speech {
  readonly supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  /** The text being read right now, so its button can show it is playing. */
  readonly speaking = signal<string | null>(null);

  private voice: SpeechSynthesisVoice | null = null;
  private current: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (!this.supported) return;
    this.pickVoice();
    speechSynthesis.addEventListener('voiceschanged', () => this.pickVoice());
  }

  speak(text: string): void {
    const phrase = text.trim();
    if (!this.supported || !phrase) return;

    // A second tap on the same word stops it; a tap on another word replaces it.
    if (this.speaking() === phrase) {
      this.stop();
      return;
    }
    this.say(phrase);
  }

  /** Reads `text` from the start, replacing whatever is being read, even if it is the same text. */
  say(text: string): void {
    const phrase = text.trim();
    if (!this.supported || !phrase) return;
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = this.voice?.lang ?? 'en-US';
    if (this.voice) utterance.voice = this.voice;
    utterance.rate = 0.9;
    // The cancelled utterance reports its end late; if the same text was just restarted,
    // that report must not mark the new one as finished.
    utterance.onend = utterance.onerror = () => {
      if (this.current === utterance) {
        this.current = null;
        this.speaking.set(null);
      }
    };
    this.current = utterance;
    this.speaking.set(phrase);
    speechSynthesis.speak(utterance);
  }

  stop(): void {
    if (!this.supported) return;
    this.current = null;
    speechSynthesis.cancel();
    this.speaking.set(null);
  }

  /** Prefers the reader's own English (en-GB, en-US…), then a local US voice, then any English. */
  private pickVoice(): void {
    const english = speechSynthesis
      .getVoices()
      .filter((v) => v.lang.toLowerCase().startsWith('en'));
    const own = navigator.language.toLowerCase();
    this.voice =
      english.find((v) => v.lang.toLowerCase() === own && v.localService) ??
      english.find((v) => v.lang.toLowerCase() === own) ??
      english.find((v) => v.lang === 'en-US' && v.localService) ??
      english.find((v) => v.lang === 'en-US') ??
      english[0] ??
      null;
  }
}
