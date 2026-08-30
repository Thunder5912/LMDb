import { AppState } from './types';

export interface BackupFile {
  app: 'lmdb-review';
  version: number;
  exportedAt: string;
  state: AppState;
}

export function createBackup(state: AppState): BackupFile {
  return {
    app: 'lmdb-review',
    version: state.version,
    exportedAt: new Date().toISOString(),
    state,
  };
}

export function downloadBackup(state: AppState): void {
  const backup = createBackup(state);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `lmdb-review-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function readBackupFile(file: File): Promise<AppState> {
  const text = await file.text();
  const data = JSON.parse(text) as Partial<BackupFile>;
  const state = data.state;
  if (!state || !Array.isArray(state.reviews) || !Array.isArray(state.watchlist)) {
    throw new Error('This file is not a valid Lmdb Review backup.');
  }
  return {
    version: state.version ?? 1,
    settings: state.settings ?? { tmdbApiKey: '', region: 'US', language: 'en-US' },
    reviews: state.reviews,
    watchlist: state.watchlist,
    lists: state.lists ?? [],
  };
}
