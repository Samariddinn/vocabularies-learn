import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestApi } from './request-api';
import type { EntryDraft } from './vocab-store';

/** Body of POST /vocabularies/create — matches the backend's VocabularyCreateDto. */
export interface CreateVocabularyRequest {
  word: string;
  meaning: string;
  pronunciation?: string;
  part_of_speech?: string;
  level?: string;
  sentences?: string;
  collocations?: string;
}

/** A row of the `vocabularies` table, as the API returns it (`.returningAll()`). */
export interface Vocabulary {
  id: string;
  user_id: string;
  word: string;
  meaning: string;
  pronunciation: string | null;
  part_of_speech: string | null;
  level: string | null;
  sentences: string | null;
  collocations: string | null;
  /** 0 = new, 1 = learning, 2 = known */
  status: 0 | 1 | 2;
  attempts: number;
  correct: number;
  streak: number;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Calls to the backend's /vocabularies endpoints. The auth interceptor adds the token. */
@Injectable({ providedIn: 'root' })
export class VocabulariesApi {
  private readonly requestApi = inject(RequestApi);

  create(body: CreateVocabularyRequest): Observable<Vocabulary> {
    return this.requestApi.post<Vocabulary>('vocabularies/create', body);
  }

  /** The logged-in user's words, newest first. */
  list(): Observable<Vocabulary[]> {
    return this.requestApi.get<Vocabulary[]>('vocabularies');
  }
}

/** Maps the notebook's draft to the API's field names. Empty fields are left out. */
export function toCreateRequest(draft: EntryDraft): CreateVocabularyRequest {
  return {
    word: draft.word,
    meaning: draft.meaning,
    pronunciation: draft.reading || undefined,
    part_of_speech: draft.pos || undefined,
    sentences: draft.example || undefined,
    collocations: draft.collocations.length ? draft.collocations.join('\n') : undefined,
  };
}
