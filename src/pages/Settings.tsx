import { FormEvent, useState } from 'react';
import { useApp } from '../context/AppContext';
import { validateKey, ValidationResult } from '../lib/api';

const FAILURE_MESSAGES: Record<Exclude<ValidationResult, { ok: true }>['reason'], string> = {
  invalid: 'The OMDb API key is incorrect. Double-check it in your account settings.',
  timeout: 'Checking the API key timed out. Check your connection and try again.',
  network: 'Could not reach OMDb. Check your internet connection and try again.',
};

const LANGUAGES = [
  'Any',
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Kannada',
  'Bengali',
  'Marathi',
  'Korean',
  'Japanese',
  'Chinese',
  'French',
  'Spanish',
  'German',
  'Italian',
  'Russian',
  'Arabic',
  'Turkish',
  'Thai',
  'Vietnamese',
  'Indonesian',
  'Portuguese',
  'Dutch',
  'Polish',
];

const REGIONS = [
  'Any',
  'United States',
  'India',
  'United Kingdom',
  'South Korea',
  'Japan',
  'China',
  'France',
  'Spain',
  'Germany',
  'Italy',
  'Russia',
  'United Arab Emirates',
  'Turkey',
  'Thailand',
  'Vietnam',
  'Indonesia',
  'Brazil',
  'Netherlands',
  'Poland',
  'Canada',
  'Australia',
];

type KeyStatus = 'idle' | 'testing' | 'ok' | 'bad';

export default function Settings() {
  const { settings, updateSettings } = useApp();
  const [key, setKey] = useState(settings.omdbApiKey);
  const [language, setLanguage] = useState(settings.preferredLanguage || 'Any');
  const [region, setRegion] = useState(settings.region || 'Any');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<KeyStatus>('idle');
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  function save(e: FormEvent) {
    e.preventDefault();
    updateSettings({
      omdbApiKey: key.trim(),
      preferredLanguage: language === 'Any' ? '' : language,
      region: region === 'Any' ? '' : region,
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
          <span>Preferred language</span>
          <select
            className="search-input"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
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
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
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
