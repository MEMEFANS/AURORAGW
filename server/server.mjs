import { createServer } from 'node:http';
import { createWriteStream, existsSync } from 'node:fs';
import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 8787);
const adminToken = process.env.ADMIN_TOKEN;
const dataPath = process.env.DATA_PATH || join(__dirname, 'data', 'site.json');
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
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain; charset=utf-8',
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

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const serveStaticSimple = async (req, res, pathname) => {
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

const serveUploadSimple = async (req, res, pathname) => {
  const requestedPath = pathname.replace('/uploads/', '');
  const normalized = normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(uploadsDir, normalized);

  if (!filePath.startsWith(uploadsDir) || !existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const fs = await import('node:fs');
  const stats = await stat(filePath);
  
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
    const chunksize = (end - start) + 1;
    
    const stream = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
    });
    await pipeline(stream, res);
  } else {
    res.writeHead(200, {
      'Content-Length': stats.size,
      'Accept-Ranges': 'bytes',
      'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
    });
    const stream = fs.createReadStream(filePath);
    await pipeline(stream, res);
  }
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

      const body = await readBody(req);
      const nextData = JSON.parse(body.toString('utf8'));
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
      
      const writeStream = createWriteStream(filePath);
      
      try {
        await pipeline(req, writeStream);
        
        const stats = await stat(filePath);
        const fileSize = stats.size;
        
        if (fileSize === 0) {
          await unlink(filePath);
          sendJson(res, 400, { message: '上传文件为空。' });
          return;
        }
        
        sendJson(res, 200, { ok: true, url: `/uploads/${fileName}`, size: fileSize });
      } catch (error) {
        try {
          if (existsSync(filePath)) {
            await unlink(filePath);
          }
        } catch (cleanupError) {
          console.error('清理上传文件失败:', cleanupError);
        }
        sendJson(res, 500, { message: '上传失败: ' + (error instanceof Error ? error.message : '未知错误') });
      }
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/uploads/')) {
      await serveUploadSimple(req, res, url.pathname);
      return;
    }

    if (req.method === 'GET' && (url.pathname === '/admin' || url.pathname.startsWith('/admin.'))) {
      await serveStaticSimple(req, res, url.pathname);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  } catch (error) {
    console.error('Server error:', error);
    sendJson(res, 500, { message: error instanceof Error ? error.message : '服务器错误' });
  }
});

server.listen(port, () => {
  console.log(`AURORA admin server: http://127.0.0.1:${port}/admin`);
  console.log(`Public API: http://127.0.0.1:${port}/api/site`);
});
