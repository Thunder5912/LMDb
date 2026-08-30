// Vercel serverless proxy for remote poster images. The browser calls
// /api/img?u=<encoded url> so the image is served same-origin, which lets
// html2canvas capture it for the "Share image" feature without a CORS taint.
export default async function handler(req, res) {
  const u = new URL(req.url || '', 'http://localhost').searchParams.get('u');
  if (!u) {
    res.statusCode = 400;
    res.end('missing u');
    return;
  }
  try {
    const r = await fetch(u);
    res.statusCode = r.status;
    const ct = r.headers.get('content-type');
    if (ct) res.setHeader('content-type', ct);
    const buf = Buffer.from(await r.arrayBuffer());
    res.end(buf);
  } catch (e) {
    res.statusCode = 502;
    res.end('image proxy error');
  }
}
