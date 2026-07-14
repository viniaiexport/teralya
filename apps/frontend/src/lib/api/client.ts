import 'server-only';
import { ApiProblem, type ProblemDetails } from './problem';

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: unknown;
}

export function getApiBaseUrl(environment: NodeJS.ProcessEnv = process.env): string {
  const value = environment.TERALYA_API_URL;
  if (value === undefined) throw new Error('TERALYA_API_URL no está configurada.');
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('TERALYA_API_URL debe usar HTTP o HTTPS.');
  return url.toString().replace(/\/$/, '');
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<ProblemDetails>;
  return typeof candidate.status === 'number' && typeof candidate.code === 'string' && typeof candidate.detail === 'string';
}

export async function apiRequest<T>(path: `/${string}`, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.token !== undefined) headers.set('Authorization', `Bearer ${options.token}`);
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: options.cache ?? 'no-store',
    headers,
  });
  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json();
  if (!response.ok) {
    if (isProblemDetails(payload)) throw new ApiProblem(payload);
    throw new Error(`La API respondió ${response.status} sin Problem Details válido.`);
  }
  return payload as T;
}
