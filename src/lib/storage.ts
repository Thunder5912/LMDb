import { AppState } from './types';

const STORAGE_KEY = 'lmdb-review:v1';
export const STATE_VERSION = 1;

export const defaultState: AppState = {
  version: STATE_VERSION,
  settings: {
    omdbApiKey: '',
  },
  reviews: [],
  watchlist: [],
  lists: [],
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...defaultState,
      ...parsed,
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      reviews: parsed.reviews || [],
      watchlist: parsed.watchlist || [],
      lists: parsed.lists || [],
    };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state', err);
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
