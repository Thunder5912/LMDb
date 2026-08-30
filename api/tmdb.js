// Vercel serverless proxy for TMDB. The browser calls /api/tmdb so requests
// never hit api.themoviedb.org directly (avoids CORS). The TMDB key is supplied
// by the client as a normal query param (?api_key=...).
export default async function handler(req, res) {
  const q = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const target = 'https://api.themoviedb.org' + q;
  try {
    const r = await fetch(target);
    const body = await r.text();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    res.statusCode = r.status;
    res.end(body);
  } catch (e) {
    res.statusCode = 502;
    res.end('TMDB proxy error');
  }
}
