import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { downloadBackup, readBackupFile } from '../lib/backup';

export default function BackupRestore() {
  const { settings, reviews, watchlist, lists, replaceState, resetAll } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  function handleExport() {
    downloadBackup({ version: 1, settings, reviews, watchlist, lists });
    setMsg('Backup downloaded.');
    setErr('');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    setMsg('');
    try {
      const state = await readBackupFile(file);
      replaceState(state);
      setMsg(`Restored ${state.reviews.length} reviews, ${state.watchlist.length} watchlist items, ${state.lists.length} lists.`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function handleReset() {
    if (confirm('Erase ALL local data? This cannot be undone.')) {
      resetAll();
      setMsg('All local data erased.');
    }
  }

  return (
    <div className="page">
      <h1>Backup &amp; Restore</h1>
      <p className="muted">
        Everything is stored in this browser. Export a JSON file to keep a copy or move to another browser/device.
      </p>

      <div className="stat-row">
        <span>{reviews.length} reviews</span>
        <span>{watchlist.length} watchlist</span>
        <span>{lists.length} lists</span>
      </div>

      <div className="row">
        <button className="btn primary" onClick={handleExport}>Export backup (JSON)</button>
        <button className="btn" onClick={() => fileRef.current?.click()}>Import backup</button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>

      <div className="callout danger-zone">
        <h3>Danger zone</h3>
        <button className="btn danger" onClick={handleReset}>Erase all local data</button>
      </div>

      {msg && <p className="ok">{msg}</p>}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
