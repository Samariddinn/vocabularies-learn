import { describe, expect, it } from 'vitest';
import { readAloud } from './review';
import type { Entry } from './vocab-store';

function entry(patch: Partial<Entry>): Entry {
  return {
    id: 'x',
    word: 'threshold',
    reading: '',
    pos: '',
    meaning: '',
    example: '',
    collocations: [],
    tags: [],
    createdAt: 0,
    reviewedAt: null,
    streak: 0,
    attempts: 0,
    correct: 0,
    ...patch,
  };
}

describe('readAloud', () => {
  it('reads every part of the card, with a pause after each', () => {
    const text = readAloud(
      entry({
        pos: 'noun',
        meaning: 'the point where something starts',
        example: 'She paused on the threshold.',
        collocations: ['cross the threshold', 'pain threshold'],
      }),
    );
    expect(text).toBe(
      'threshold. noun. the point where something starts. ' +
        'For example: She paused on the threshold. ' +
        'Goes with: cross the threshold, pain threshold.',
    );
  });

  it('skips the parts that were left empty', () => {
    expect(readAloud(entry({ meaning: 'a doorway?' }))).toBe('threshold. a doorway?');
  });
});
