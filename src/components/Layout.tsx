import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const links = [
  { to: '/search', label: 'Search' },
  { to: '/diary', label: 'Diary' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/lists', label: 'Lists' },
  { to: '/backup', label: 'Backup' },
  { to: '/settings', label: 'Settings' },
];

type Theme = 'dark' | 'light';

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('lmdb-theme');
    return stored === 'light' ? 'light' : 'dark';
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('lmdb-theme', theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) };
}

export default function Layout({ children }: { children: ReactNode }) {
  const { settings } = useApp();
  const location = useLocation();
  const hasKey = !!settings.omdbApiKey;
  const { theme, toggle } = useTheme();

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/search" className="brand">
          <span className="brand-mark">L</span>
          <span className="brand-name">LMdb</span>
        </NavLink>

        <button
          type="button"
          className="btn small theme-toggle"
          onClick={toggle}
          aria-label="Toggle color theme"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? '☾' : '☀'}
        </button>
      </header>

      <nav className="floating-menu" aria-label="Main menu">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => 'floating-item' + (isActive ? ' active' : '')}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      {!hasKey && location.pathname !== '/settings' && (
        <div className="api-warning">
          No OMDb API key set. <NavLink to="/settings">Add one in Settings</NavLink> to search movies.
        </div>
      )}

      <main className="content">{children}</main>

      <footer className="footer">
        <span>LMdb</span>
        <span className="footer-note">Your data is stored only in this browser.</span>
      </footer>
    </div>
  );
}
