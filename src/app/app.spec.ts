import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { App } from './app';
import { normalize, statusOf, type Entry } from './vocab-store';

function entry(patch: Partial<Entry>): Entry {
  return {
    id: 'x',
    word: 'linger',
    reading: '',
    pos: '',
    meaning: 'to stay longer than expected',
    example: '',
    tags: [],
    createdAt: 0,
    reviewedAt: null,
    streak: 0,
    attempts: 0,
    correct: 0,
    ...patch,
  };
}

describe('vocab notebook', () => {
  it('renders the masthead', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Vocabulary');
  });

  it('forgives case, spacing and a trailing full stop', () => {
    expect(normalize('  Linger. ')).toBe('linger');
  });

  it('moves a word from new to learning to memorized', () => {
    expect(statusOf(entry({}))).toBe('new');
    expect(statusOf(entry({ attempts: 1, streak: 1 }))).toBe('learning');
    expect(statusOf(entry({ attempts: 9, streak: 5 }))).toBe('known');
  });
});
