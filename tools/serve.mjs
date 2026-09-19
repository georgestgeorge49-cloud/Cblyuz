/** Minimal static server for local preview. No dependencies.
 *  Supports HTTP Range requests (206 Partial Content) — required for
 *  scrubbing/seeking in <audio>/<video> elements on large files.
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 4321;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let path = normalize(join(ROOT, url));
    if (!path.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    let info = await stat(path).catch(() => null);
    if (info?.isDirectory()) {
      path = join(path, 'index.html');
      info = await stat(path).catch(() => null);
    }
    if (!info) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found: ' + url);
      return;
    }

    const type = TYPES[extname(path)] || 'application/octet-stream';
    const baseHeaders = {
      'content-type': type,
      'cache-control': 'no-store',
      'accept-ranges': 'bytes',
    };

    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = m && m[1] ? Number(m[1]) : 0;
      const end = m && m[2] ? Number(m[2]) : info.size - 1;
      if (!m || start > end || end >= info.size) {
        res.writeHead(416, { ...baseHeaders, 'content-range': `bytes */${info.size}` }).end();
        return;
      }
      res.writeHead(206, {
        ...baseHeaders,
        'content-range': `bytes ${start}-${end}/${info.size}`,
        'content-length': end - start + 1,
      });
      createReadStream(path, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, { ...baseHeaders, 'content-length': info.size });
    createReadStream(path).pipe(res);
  } catch (err) {
    res.writeHead(500).end(String(err));
  }
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
