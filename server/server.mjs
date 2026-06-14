import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 8787);
const adminToken = process.env.ADMIN_TOKEN;
const dataPath = join(__dirname, 'data', 'site.json');
const publicDir = join(__dirname, 'public');
const uploadsDir = join(__dirname, 'uploads');

if (!adminToken) {
  console.error('Missing ADMIN_TOKEN. Set a strong backend password before starting the server.');
  process.exit(1);
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(JSON.stringify(payload));
};

const readJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

const readBinaryBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const readSiteData = async () => {
  const data = await readFile(dataPath, 'utf8');
  return JSON.parse(data);
};

const writeSiteData = async (data) => {
  await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
};

const safeUploadName = (name) => {
  const parsed = basename(name || 'video.mp4').replace(/[^\w.-]+/g, '-');
  const extension = extname(parsed).toLowerCase() || '.mp4';
  const base = parsed.replace(extension, '').slice(0, 60) || 'video';
  return `${Date.now()}-${base}${extension}`;
};

const hasAdminAuth = (req) => {
  const authHeader = req.headers.authorization || '';
  return authHeader === `Bearer ${adminToken}`;
};

const serveStatic = async (req, res, pathname) => {
  const requestedPath = pathname === '/admin' ? '/admin.html' : pathname;
  const normalized = normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(publicDir, normalized);

  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const body = await readFile(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' });
  res.end(body);
};

const serveUpload = async (res, pathname) => {
  const requestedPath = pathname.replace('/uploads/', '');
  const normalized = normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(uploadsDir, normalized);

  if (!filePath.startsWith(uploadsDir) || !existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const body = await readFile(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream' });
  res.end(body);
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {});
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/site') {
      sendJson(res, 200, await readSiteData());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/site') {
      if (!hasAdminAuth(req)) {
        sendJson(res, 401, { message: '未授权，请输入正确后台密钥。' });
        return;
      }

      sendJson(res, 200, await readSiteData());
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/site') {
      if (!hasAdminAuth(req)) {
        sendJson(res, 401, { message: '未授权，请输入正确后台密钥。' });
        return;
      }

      const nextData = await readJsonBody(req);
      await writeSiteData(nextData);
      sendJson(res, 200, { ok: true, data: nextData });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/upload') {
      if (!hasAdminAuth(req)) {
        sendJson(res, 401, { message: '未授权，请输入正确后台密钥。' });
        return;
      }

      await mkdir(uploadsDir, { recursive: true });
      const fileName = safeUploadName(url.searchParams.get('filename'));
      const filePath = join(uploadsDir, fileName);
      const fileBody = await readBinaryBody(req);

      if (!fileBody.length) {
        sendJson(res, 400, { message: '上传文件为空。' });
        return;
      }

      await writeFile(filePath, fileBody);
      sendJson(res, 200, { ok: true, url: `/uploads/${fileName}` });
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/uploads/')) {
      await serveUpload(res, url.pathname);
      return;
    }

    if (req.method === 'GET' && (url.pathname === '/admin' || url.pathname.startsWith('/admin.'))) {
      await serveStatic(req, res, url.pathname);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  } catch (error) {
    sendJson(res, 500, { message: error instanceof Error ? error.message : '服务器错误' });
  }
});

server.listen(port, () => {
  console.log(`AURORA admin server: http://127.0.0.1:${port}/admin`);
  console.log(`Public API: http://127.0.0.1:${port}/api/site`);
});
