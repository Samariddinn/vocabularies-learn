import { Injectable } from '@angular/core';

/** The parts of speech the entry form offers. Anything else the dictionary says is dropped. */
export const PARTS_OF_SPEECH = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'pronoun',
  'conjunction',
  'interjection',
  'phrase',
  'phrasal verb',
  'idiom',
] as const;

export interface Sense {
  pos: string;
  definition: string;
}

export interface Lookup {
  /** In dictionary order, without repeats. */
  parts: string[];
  /** IPA, e.g. /ˈθɹɛʃhəʊld/. Empty when the dictionary has none. */
  reading: string;
  senses: Sense[];
  /** 'dictionary' came from the API; 'rule' was worked out from the shape of a phrase. */
  source: 'dictionary' | 'rule';
}

const PARTICLES = new Set([
  'up', 'down', 'out', 'off', 'in', 'on', 'over', 'away', 'back', 'through', 'around',
  'about', 'along', 'into', 'onto', 'across', 'after', 'apart', 'by', 'forward', 'together',
]);

/**
 * Looks words up in the free Wiktionary-backed dictionaryapi.dev. It only knows single
 * words, so phrases are classified by shape instead: "give up" is a phrasal verb,
 * "sell at a loss" is a phrase.
 */
@Injectable({ providedIn: 'root' })
export class Dictionary {
  private readonly cache = new Map<string, Promise<Lookup | null>>();

  lookup(word: string): Promise<Lookup | null> {
    const key = word.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!key) return Promise.resolve(null);

    let pending = this.cache.get(key);
    if (!pending) {
      pending = key.includes(' ') ? Promise.resolve(byShape(key)) : fetchWord(key);
      // A network failure shouldn't stick: forget it so the next try asks again.
      pending.catch(() => this.cache.delete(key));
      this.cache.set(key, pending);
    }
    return pending;
  }
}

function byShape(phrase: string): Lookup {
  const tokens = phrase.replace(/^to /, '').split(' ');
  const phrasal = tokens.length <= 3 && tokens.length >= 2 && PARTICLES.has(tokens.at(-1)!);
  return { parts: [phrasal ? 'phrasal verb' : 'phrase'], reading: '', senses: [], source: 'rule' };
}

interface ApiEntry {
  phonetic?: string;
  phonetics?: { text?: string }[];
  meanings?: { partOfSpeech?: string; definitions?: { definition?: string }[] }[];
}

/** A dead server can hang for 20s+ before Cloudflare gives up with a 522. */
const TIMEOUT_MS = 4000;

/**
 * Both are asked at once. dictionaryapi.dev has the better definitions but goes down
 * now and then, so Datamuse (WordNet) covers for it. Datamuse always supplies the
 * pronunciation, because its phonemes turn into a readable respelling where IPA
 * doesn't. Resolves null when neither knows the word; rejects only when neither
 * could be reached.
 */
async function fetchWord(word: string): Promise<Lookup | null> {
  const [primary, backup] = await Promise.allSettled([fromDictionaryApi(word), fromDatamuse(word)]);
  const main = primary.status === 'fulfilled' ? primary.value : null;
  const extra = backup.status === 'fulfilled' ? backup.value : null;
  if (primary.status === 'rejected' && backup.status === 'rejected') throw primary.reason;

  const found = main ?? extra;
  if (!found) return null;
  return { ...found, reading: extra?.reading || found.reading };
}

async function fromDictionaryApi(word: string): Promise<Lookup | null> {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`dictionary answered ${response.status}`);

  const entries = (await response.json()) as ApiEntry[];
  const known = new Set<string>(PARTS_OF_SPEECH);
  const parts: string[] = [];
  const senses: Sense[] = [];
  let reading = '';

  for (const entry of entries) {
    reading ||= entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || '';
    for (const meaning of entry.meanings ?? []) {
      const pos = meaning.partOfSpeech?.toLowerCase() ?? '';
      if (!known.has(pos)) continue;
      if (!parts.includes(pos)) parts.push(pos);
      for (const d of meaning.definitions ?? []) {
        if (d.definition) senses.push({ pos, definition: d.definition });
      }
    }
  }

  if (parts.length === 0) return null;
  return { parts, reading, senses, source: 'dictionary' };
}

interface DatamuseWord {
  word: string;
  tags?: string[];
  defs?: string[];
}

const DATAMUSE_POS: Record<string, string> = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb' };

async function fromDatamuse(word: string): Promise<Lookup | null> {
  const response = await fetch(
    `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=dpr&max=1`,
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  if (!response.ok) throw new Error(`datamuse answered ${response.status}`);

  // `sp` is a spelling search, so the top hit can be a different word.
  const [hit] = (await response.json()) as DatamuseWord[];
  if (!hit || hit.word.toLowerCase() !== word) return null;

  const parts: string[] = [];
  const senses: Sense[] = [];
  // Definitions arrive as "n\tthe starting point…".
  for (const line of hit.defs ?? []) {
    const [code, definition] = line.split('\t');
    const pos = DATAMUSE_POS[code];
    if (!pos || !definition) continue;
    if (!parts.includes(pos)) parts.push(pos);
    senses.push({ pos, definition });
  }
  for (const tag of hit.tags ?? []) {
    const pos = DATAMUSE_POS[tag];
    if (pos && !parts.includes(pos)) parts.push(pos);
  }

  if (parts.length === 0) return null;
  const pron = hit.tags?.find((tag) => tag.startsWith('pron:'))?.slice('pron:'.length);
  return { parts, reading: pron ? respell(pron) : '', senses, source: 'dictionary' };
}

/** ARPAbet vowels → respelling. The second form is used when consonants close the syllable. */
const VOWELS: Record<string, [open: string, closed: string]> = {
  AA: ['ah', 'ah'],
  AE: ['a', 'a'],
  AH: ['uh', 'u'],
  AO: ['aw', 'aw'],
  AW: ['ow', 'ow'],
  AY: ['eye', 'y'],
  EH: ['eh', 'e'],
  ER: ['ur', 'ur'],
  EY: ['ay', 'ay'],
  IH: ['ih', 'i'],
  IY: ['ee', 'ee'],
  OW: ['oh', 'oh'],
  OY: ['oy', 'oy'],
  UH: ['uu', 'uu'],
  UW: ['oo', 'oo'],
};

const CONSONANTS: Record<string, string> = {
  B: 'b', CH: 'ch', D: 'd', DH: 'dh', F: 'f', G: 'g', HH: 'h', JH: 'j', K: 'k', L: 'l',
  M: 'm', N: 'n', NG: 'ng', P: 'p', R: 'r', S: 's', SH: 'sh', T: 't', TH: 'th', V: 'v',
  W: 'w', Y: 'y', Z: 'z', ZH: 'zh',
};

/** Consonant pairs English lets a syllable start with, so "S T" in sus-tain goes right. */
const ONSETS = new Set([
  'S T', 'S P', 'S K', 'S L', 'S M', 'S N', 'S W', 'B L', 'B R', 'D R', 'D W', 'F L', 'F R',
  'G L', 'G R', 'K L', 'K R', 'K W', 'P L', 'P R', 'T R', 'T W', 'TH R', 'SH R',
]);

/**
 * Turns Datamuse's ARPAbet ("S AH0 S T EY1 N AH0 B AH0 L") into a respelling a learner
 * can read ("suh-STAY-nuh-buhl"), with the stressed syllable in capitals.
 */
export function respell(arpabet: string): string {
  const phones = arpabet.trim().split(/\s+/).filter(Boolean);
  const nuclei = phones.flatMap((phone, i) => (/\d$/.test(phone) ? [i] : []));
  if (nuclei.length === 0) return '';

  // Where each syllable starts: give the next syllable as many consonants as can begin one.
  const starts = [0];
  for (let n = 1; n < nuclei.length; n++) {
    const gap = phones.slice(nuclei[n - 1] + 1, nuclei[n]);
    // A stressed short vowel keeps a lone consonant after it: THRESH-ohld, not THREH-shohld.
    const short = /^(EH|IH|AE|AH|UH)1$/.test(phones[nuclei[n - 1]]);
    let onset = gap.length === 1 && short ? 0 : gap.length ? 1 : 0;
    if (gap.length >= 2 && ONSETS.has(gap.slice(-2).join(' '))) onset = 2;
    if (gap.length >= 3 && gap[gap.length - 3] === 'S' && ONSETS.has(gap.slice(-2).join(' '))) onset = 3;
    starts.push(nuclei[n] - onset);
  }

  return starts
    .map((start, n) => {
      const end = n + 1 < starts.length ? starts[n + 1] : phones.length;
      const syllable = phones.slice(start, end);
      const nucleus = nuclei[n] - start;
      const closed = nucleus < syllable.length - 1;
      const text = syllable
        .map((phone, i) => {
          if (i !== nucleus) return CONSONANTS[phone] ?? '';
          const [open, shut] = VOWELS[phone.slice(0, -1)] ?? ['', ''];
          // "eye" only stands alone; with a consonant before it, "sky" reads as sky.
          if (phone.startsWith('AY') && !closed && nucleus > 0) return 'y';
          // Unstressed schwa always reads "uh": -buhl, not -bul.
          if (phone === 'AH0') return open;
          return closed ? shut : open;
        })
        .join('');
      return syllable[nucleus].endsWith('1') ? text.toUpperCase() : text;
    })
    .join('-');
}
