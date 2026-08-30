import { useState } from 'react';
import { useApp } from '../context/AppContext';
import MovieCard from '../components/MovieCard';

export default function Lists() {
  const { lists, createList, deleteList, removeFromList } = useApp();
  const [name, setName] = useState('');

  function add(e: React.FormEvent) {
    e.preventDefault();
    const created = createList(name);
    if (created) setName('');
  }

  return (
    <div className="page">
      <h1>Lists</h1>

      <form className="form inline" onSubmit={add}>
        <input
          placeholder="New list name (e.g. Sci-Fi)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn primary" type="submit">Create</button>
      </form>

      {lists.length === 0 && <p className="muted">No custom lists yet.</p>}

      {lists.map((l) => (
        <section key={l.id} className="list-block">
          <div className="list-head">
            <h2>{l.name} <span className="count">({l.items.length})</span></h2>
            <div className="row">
              <button className="btn small danger" onClick={() => deleteList(l.id)}>Delete list</button>
            </div>
          </div>
          {l.items.length === 0 ? (
            <p className="muted">Empty. Add films from a movie page.</p>
          ) : (
            <div className="grid">
              {l.items.map((it) => (
                <div key={it.id} className="watchlist-item">
                  <MovieCard id={it.id} title={it.title} posterPath={it.posterPath} releaseDate={it.releaseDate} />
                  <button className="btn small danger" onClick={() => removeFromList(l.id, it.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
