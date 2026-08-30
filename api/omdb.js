// Vercel serverless proxy for OMDb. The browser calls /api/omdb so requests
// never hit omdbapi.com directly (avoids CORS). The OMDb key is supplied by the
// client as a normal query param (?apikey=...).
export default async function handler(req, res) {
  const q = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const target = 'https://www.omdbapi.com' + q;
  try {
    const r = await fetch(target);
    const body = await r.text();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    res.statusCode = r.status;
    res.end(body);
  } catch (e) {
    res.statusCode = 502;
    res.end('OMDb proxy error');
  }
}
