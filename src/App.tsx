import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Settings from './pages/Settings';
import Search from './pages/Search';
import MovieDetail from './pages/MovieDetail';
import LogReview from './pages/LogReview';
import Diary from './pages/Diary';
import Watchlist from './pages/Watchlist';
import Lists from './pages/Lists';
import BackupRestore from './pages/BackupRestore';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/log/:id" element={<LogReview />} />
        <Route path="/log/:id/:reviewId" element={<LogReview />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/backup" element={<BackupRestore />} />
        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
    </Layout>
  );
}
