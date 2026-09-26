import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type ParamValue = string | number | boolean;

/** Query params as a plain object. `null` / `undefined` values are skipped. */
export type QueryParams = Record<string, ParamValue | readonly ParamValue[] | null | undefined>;

export interface RequestOptions {
  params?: QueryParams;
  headers?: Record<string, string>;
}

/**
 * Thin wrapper around HttpClient for talking to our NestJS backend.
 * Paths are relative to `environment.apiUrl`:
 *
 *   requestApi.get<Word[]>('words', { params: { page: 1 } })
 *   requestApi.post<Word>('words', { term: 'apple' })
 */
@Injectable({ providedIn: 'root' })
export class RequestApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/+$/, '');

  get<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(this.url(path), this.httpOptions(options));
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.http.post<T>(this.url(path), body ?? null, this.httpOptions(options));
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.http.put<T>(this.url(path), body ?? null, this.httpOptions(options));
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.http.patch<T>(this.url(path), body ?? null, this.httpOptions(options));
  }

  delete<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(this.url(path), this.httpOptions(options));
  }

  private url(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
  }

  private httpOptions(options?: RequestOptions): { params: HttpParams; headers?: HttpHeaders } {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(options?.params ?? {})) {
      if (value === null || value === undefined) continue;
      const values: readonly ParamValue[] = Array.isArray(value) ? value : [value as ParamValue];
      for (const v of values) params = params.append(key, String(v));
    }
    return {
      params,
      ...(options?.headers && { headers: new HttpHeaders(options.headers) }),
    };
  }
}
