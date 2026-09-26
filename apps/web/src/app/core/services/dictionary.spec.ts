import { describe, expect, it } from 'vitest';
import { respell } from './dictionary';

describe('respell', () => {
  it('turns ARPAbet into a readable respelling with the stress in capitals', () => {
    expect(respell('S AH0 S T EY1 N AH0 B AH0 L ')).toBe('suh-STAY-nuh-buhl');
    expect(respell('TH R EH1 SH OW0 L D')).toBe('THRESH-ohld');
    expect(respell('L IH1 NG G ER0')).toBe('LING-gur');
    expect(respell('S K AY1')).toBe('SKY');
    expect(respell('K AH1 T')).toBe('KUT');
  });

  it('gives nothing back for an empty pronunciation', () => {
    expect(respell('')).toBe('');
  });
});
