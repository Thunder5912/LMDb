import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { defaultState, loadState, saveState } from '../lib/storage';
import { AppState, Review, Settings, WatchlistItem, AppList, MovieSummary } from '../lib/types';

interface AppContextValue extends AppState {
  updateSettings: (patch: Partial<Settings>) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => Review;
  updateReview: (id: string, patch: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  getReviewForMovie: (tmdbId: string) => Review | undefined;
  toggleWatchlist: (movie: MovieSummary) => void;
  isInWatchlist: (tmdbId: string) => boolean;
  removeFromWatchlist: (tmdbId: string) => void;
  createList: (name: string) => AppList | undefined;
  deleteList: (listId: string) => void;
  addToList: (listId: string, movie: MovieSummary) => void;
  removeFromList: (listId: string, tmdbId: string) => void;
  replaceState: (state: AppState) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const addReview = useCallback((review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Review => {
    const now = new Date().toISOString();
    const full: Review = { ...review, id: uid(), createdAt: now, updatedAt: now };
    setState((prev) => ({ ...prev, reviews: [full, ...prev.reviews] }));
    return full;
  }, []);

  const updateReview = useCallback((id: string, patch: Partial<Review>) => {
    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) =>
        r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r
      ),
    }));
  }, []);

  const deleteReview = useCallback((id: string) => {
    setState((prev) => ({ ...prev, reviews: prev.reviews.filter((r) => r.id !== id) }));
  }, []);

  const getReviewForMovie = useCallback(
    (tmdbId: string) => state.reviews.find((r) => r.tmdbId === tmdbId),
    [state.reviews]
  );

  const toggleWatchlist = useCallback((movie: MovieSummary) => {
    setState((prev) => {
      const exists = prev.watchlist.some((w) => w.id === movie.id);
      if (exists) {
        return { ...prev, watchlist: prev.watchlist.filter((w) => w.id !== movie.id) };
      }
      const item: WatchlistItem = {
        id: movie.id,
        title: movie.title,
        posterPath: movie.posterPath,
        releaseDate: movie.releaseDate,
        addedAt: new Date().toISOString(),
      };
      return { ...prev, watchlist: [item, ...prev.watchlist] };
    });
  }, []);

  const isInWatchlist = useCallback(
    (tmdbId: string) => state.watchlist.some((w) => w.id === tmdbId),
    [state.watchlist]
  );

  const removeFromWatchlist = useCallback((tmdbId: string) => {
    setState((prev) => ({ ...prev, watchlist: prev.watchlist.filter((w) => w.id !== tmdbId) }));
  }, []);

  const createList = useCallback((name: string): AppList | undefined => {
    const trimmed = name.trim();
    if (!trimmed) return undefined;
    const list: AppList = {
      id: uid(),
      name: trimmed,
      items: [],
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, lists: [...prev.lists, list] }));
    return list;
  }, []);

  const deleteList = useCallback((listId: string) => {
    setState((prev) => ({ ...prev, lists: prev.lists.filter((l) => l.id !== listId) }));
  }, []);

  const addToList = useCallback((listId: string, movie: MovieSummary) => {
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => {
        if (l.id !== listId) return l;
        if (l.items.some((i) => i.id === movie.id)) return l;
        const item: WatchlistItem = {
          id: movie.id,
          title: movie.title,
          posterPath: movie.posterPath,
          releaseDate: movie.releaseDate,
          addedAt: new Date().toISOString(),
        };
        return { ...l, items: [item, ...l.items] };
      }),
    }));
  }, []);

  const removeFromList = useCallback((listId: string, tmdbId: string) => {
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((l) =>
        l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== tmdbId) } : l
      ),
    }));
  }, []);

  const replaceState = useCallback((next: AppState) => {
    setState({ ...defaultState, ...next, settings: { ...defaultState.settings, ...next.settings } });
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      updateSettings,
      addReview,
      updateReview,
      deleteReview,
      getReviewForMovie,
      toggleWatchlist,
      isInWatchlist,
      removeFromWatchlist,
      createList,
      deleteList,
      addToList,
      removeFromList,
      replaceState,
      resetAll,
    }),
    [
      state,
      updateSettings,
      addReview,
      updateReview,
      deleteReview,
      getReviewForMovie,
      toggleWatchlist,
      isInWatchlist,
      removeFromWatchlist,
      createList,
      deleteList,
      addToList,
      removeFromList,
      replaceState,
      resetAll,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
