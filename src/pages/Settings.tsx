import { FormEvent, useState } from 'react';
import { useApp } from '../context/AppContext';
import { validateKey, ValidationResult } from '../lib/api';

const FAILURE_MESSAGES: Record<Exclude<ValidationResult, { ok: true }>['reason'], string> = {
  invalid: 'The OMDb API key is incorrect. Double-check it in your account settings.',
  timeout: 'Checking the API key timed out. Check your connection and try again.',
  network: 'Could not reach OMDb. Check your internet connection and try again.',
};

export const LANGUAGES: { label: string; code: string }[] = [
  { label: 'English', code: 'en' },
  { label: 'Hindi', code: 'hi' },
  { label: 'Tamil', code: 'ta' },
  { label: 'Telugu', code: 'te' },
  { label: 'Malayalam', code: 'ml' },
  { label: 'Kannada', code: 'kn' },
  { label: 'Bengali', code: 'bn' },
  { label: 'Marathi', code: 'mr' },
  { label: 'Korean', code: 'ko' },
  { label: 'Japanese', code: 'ja' },
  { label: 'Chinese', code: 'zh' },
  { label: 'French', code: 'fr' },
  { label: 'Spanish', code: 'es' },
  { label: 'German', code: 'de' },
  { label: 'Italian', code: 'it' },
  { label: 'Russian', code: 'ru' },
  { label: 'Arabic', code: 'ar' },
  { label: 'Turkish', code: 'tr' },
  { label: 'Thai', code: 'th' },
  { label: 'Vietnamese', code: 'vi' },
  { label: 'Indonesian', code: 'id' },
  { label: 'Portuguese', code: 'pt' },
  { label: 'Dutch', code: 'nl' },
  { label: 'Polish', code: 'pl' },
];

export const REGIONS: { label: string; code: string }[] = [
  { label: 'United States', code: 'US' },
  { label: 'India', code: 'IN' },
  { label: 'United Kingdom', code: 'GB' },
  { label: 'South Korea', code: 'KR' },
  { label: 'Japan', code: 'JP' },
  { label: 'China', code: 'CN' },
  { label: 'France', code: 'FR' },
  { label: 'Spain', code: 'ES' },
  { label: 'Germany', code: 'DE' },
  { label: 'Italy', code: 'IT' },
  { label: 'Russia', code: 'RU' },
  { label: 'United Arab Emirates', code: 'AE' },
  { label: 'Turkey', code: 'TR' },
  { label: 'Thailand', code: 'TH' },
  { label: 'Vietnam', code: 'VN' },
  { label: 'Indonesia', code: 'ID' },
  { label: 'Brazil', code: 'BR' },
  { label: 'Netherlands', code: 'NL' },
  { label: 'Poland', code: 'PL' },
  { label: 'Canada', code: 'CA' },
  { label: 'Australia', code: 'AU' },
];

type KeyStatus = 'idle' | 'testing' | 'ok' | 'bad';

export default function Settings() {
  const { settings, updateSettings } = useApp();
  const [key, setKey] = useState(settings.omdbApiKey);
  const [tmdbKey, setTmdbKey] = useState(settings.tmdbApiKey);
  const [language, setLanguage] = useState(settings.preferredLanguage || '');
  const [region, setRegion] = useState(settings.region || '');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<KeyStatus>('idle');
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  function save(e: FormEvent) {
    e.preventDefault();
    updateSettings({
      omdbApiKey: key.trim(),
      tmdbApiKey: tmdbKey.trim(),
      preferredLanguage: language,
      region: region,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function testKey() {
    const trimmed = key.trim();
    if (!trimmed) {
      setStatus('bad');
      const msg = 'Please enter an OMDb API key before testing.';
      setMessage(msg);
      alert(msg);
      return;
    }
    setStatus('testing');
    setMessage('');
    const result = await validateKey(trimmed);
    if (result.ok) {
      setStatus('ok');
      const msg = 'OMDb API key is correct.';
      setMessage(msg);
      alert(msg);
    } else {
      setStatus('bad');
      const base = FAILURE_MESSAGES[result.reason];
      const msg = result.detail ? `${base} (${result.detail})` : base;
      setMessage(msg);
      alert(msg);
    }
  }

  return (
    <div className="page">
      <h1>Settings</h1>
      <form className="form" onSubmit={save}>
        <label className="field">
          <span>OMDb API Key</span>
          <div className="key-row">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste your OMDb API key"
              autoComplete="off"
            />
            <button
              type="button"
              className="btn small"
              onClick={() => setShowKey((v) => !v)}
              title={showKey ? 'Hide' : 'Show'}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
            <button type="button" className="btn small" onClick={testKey} disabled={!key || status === 'testing'}>
              {status === 'testing' ? 'Testing…' : 'Test key'}
            </button>
          </div>
          {status === 'ok' && <span className="ok">Key works ✓</span>}
          {status === 'bad' && <span className="err">Key invalid ✗</span>}
          {message && <span className={status === 'ok' ? 'ok' : 'err'}>{message}</span>}
        </label>

        <label className="field">
          <span>TMDB API Key</span>
          <div className="key-row">
            <input
              type={showKey ? 'text' : 'password'}
              value={tmdbKey}
              onChange={(e) => setTmdbKey(e.target.value)}
              placeholder="Paste your TMDB API key (v3 auth key)"
              autoComplete="off"
            />
            <button
              type="button"
              className="btn small"
              onClick={() => setShowKey((v) => !v)}
              title={showKey ? 'Hide' : 'Show'}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <span className="muted">Powers the home-page suggestions filtered by language &amp; region. Get one at themoviedb.org.</span>
        </label>

        <label className="field">
          <span>Preferred language</span>
          <select
            className="search-input"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">Any</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <span className="muted">Used to suggest movies in the languages you watch.</span>
        </label>

        <label className="field">
          <span>Region</span>
          <select
            className="search-input"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="">Any</option>
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
          <span className="muted">Used together with language to tailor suggestions.</span>
        </label>

        <button type="submit" className="btn primary">Save settings</button>
        {saved && <span className="ok">Saved locally.</span>}
      </form>

      <div className="callout">
        <h3>Where do I get an OMDb API key?</h3>
        <ol>
          <li>Get a free key at <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noreferrer">omdbapi.com</a> (free tier: 1000 requests/day).</li>
          <li>Paste it above and click <strong>Test key</strong>.</li>
          <li>It is stored only in this browser (localStorage).</li>
        </ol>
        <p className="muted">
          Note: a client-side key is visible to anyone using this browser and in requests to OMDb. Use a key
          dedicated to this app, not a production key.
        </p>
      </div>
    </div>
  );
}
