// 识典古籍检索小工具 — Node 代理服务
// 原理：识典古籍搜索页为服务端渲染，页面内嵌 window._ROUTER_DATA 结构化数据。
// 本服务代为抓取该页面并解析为干净 JSON，供前端展示。
// 数据版权归原书整理方与识典古籍平台，本工具仅做个人检索用途。

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const HOST = process.env.HOST || '0.0.0.0';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

// —— 轻量防滥用：单 IP 每分钟最多 30 次检索，并发上游请求不超过 6 个 ——
const RATE_WINDOW = 60 * 1000;
const RATE_MAX = 30;
const hits = new Map();
let inflight = 0;
const MAX_INFLIGHT = 6;

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > RATE_WINDOW) {
    hits.set(ip, { start: now, n: 1 });
    if (hits.size > 5000) hits.delete(hits.keys().next().value);
    return false;
  }
  rec.n += 1;
  return rec.n > RATE_MAX;
}

function parseRouterData(html) {
  const key = 'window._ROUTER_DATA';
  const i = html.indexOf(key);
  if (i === -1) return null;
  const start = html.indexOf('=', i) + 1;
  let j = html.indexOf('<', start);
  if (j === -1) j = html.length;
  const blob = html.slice(start, j).trim().replace(/;$/, '');
  return JSON.parse(blob);
}

function flattenLines(contentJson) {
  // paragraph.content 是 JSON 字符串：{ lines: [{ lineType, content, ... }] }
  try {
    const obj = JSON.parse(contentJson);
    return (obj.lines || [])
      .filter((l) => l.lineType !== 3 && l.content) // 3 = 页码标记，跳过
      .map((l) => l.content.trim())
      .join('');
  } catch {
    return '';
  }
}

function chapterPath(chapterNames) {
  if (!Array.isArray(chapterNames)) return '';
  return chapterNames
    .map((c) => ((c.lines || []).map((l) => l.content).join('') || '').trim())
    .filter(Boolean)
    .join(' › ');
}

function cleanSearch(raw, query) {
  // SSR 数据挂在 loaderData 下，key 形如 "__session/(lang$)/search.(query$)/page"
  const ld = (raw && raw.loaderData) || {};
  let data = null;
  for (const k of Object.keys(ld)) {
    const v = ld[k];
    if (v && v.data && Array.isArray(v.data.paragraphs)) {
      data = v.data;
      break;
    }
  }
  if (!data) return { ok: false, reason: 'empty' };

  const paragraphs = (data.paragraphs || []).map((p, idx) => {
    const b = p.bookInfo || {};
    return {
      id: p.paragraph && p.paragraph.paragraphId,
      bookId: b.bookId || '',
      bookName: b.bookName || '佚名',
      authors: (b.authors || []).map(
        (a) => `${a.dynastyName ? a.dynastyName + '·' : ''}${a.persName}（${a.responsibleTypeStr || '著'}）`
      ),
      edition: b.edition && b.edition.edition ? b.edition.edition : '',
      editionDynasty: b.edition && b.edition.editionDynastyName ? b.edition.editionDynastyName : '',
      cover: b.beautifulCover || b.coverUrl || '',
      chapter: chapterPath(p.chapterNames),
      text: flattenLines(p.paragraph && p.paragraph.content),
      perfectMatch: !!p.isContentPerfectMatch,
      url: b.bookId ? `https://www.shidianguji.com/book/${b.bookId}` : 'https://www.shidianguji.com',
    };
  });

  const recommends = [];
  const rb = data.recommendBooks && data.recommendBooks.books;
  if (Array.isArray(rb)) {
    for (const b of rb.slice(0, 8)) {
      recommends.push({
        bookId: b.bookId,
        bookName: b.bookName,
        authors: (b.authors || []).map((a) => `${a.dynastyName || ''}·${a.persName}`).join('、'),
        brief: b.brief || b.intro || '',
        cover: b.beautifulCover || b.coverUrl || '',
        url: `https://www.shidianguji.com/book/${b.bookId}`,
      });
    }
  }

  return {
    ok: true,
    query,
    correctedText: data.correctedText || '',
    total: data.total || 0,
    phrases: data.phrases || [],
    segments: data.segments || [],
    paragraphs,
    recommends,
    officialUrl: `https://www.shidianguji.com/search/${encodeURIComponent(query)}`,
  };
}

// 结果缓存：同一关键词 10 分钟内复用，减少对上游的请求
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchOnce(query) {
  const url = `https://www.shidianguji.com/search/${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'zh-CN,zh;q=0.9',
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error('上游返回 ' + res.status);
  const html = await res.text();
  if (!html || html.length < 5000) throw new Error('上游返回内容不完整');
  const raw = parseRouterData(html);
  if (!raw) throw new Error('页面结构解析失败');
  const cleaned = cleanSearch(raw, query);
  if (!cleaned.ok) throw new Error('该页面未包含检索数据');
  return cleaned;
}

async function searchShidian(query) {
  const hit = cache.get(query);
  if (hit && Date.now() - hit.t < CACHE_TTL) return hit.data;

  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const data = await fetchOnce(query);
      cache.set(query, { t: Date.now(), data });
      if (cache.size > 200) cache.delete(cache.keys().next().value);
      return data;
    } catch (e) {
      lastErr = e;
      if (attempt < 2) await sleep(600 * (attempt + 1));
    }
  }
  throw lastErr || new Error('未知错误');
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);

  // 允许静态预览页/其他来源探测并跳转到本服务
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return res.end();
  }

  if (u.pathname === '/api/health') {
    return json(res, 200, { ok: true, service: 'shidianguji-proxy', port: PORT }, cors);
  }

  if (u.pathname === '/api/search') {
    const q = (u.searchParams.get('q') || '').trim();
    if (!q) return json(res, 400, { ok: false, reason: '缺少检索词' }, cors);
    if (q.length > 40) return json(res, 400, { ok: false, reason: '检索词过长' }, cors);

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    if (rateLimited(ip)) {
      return json(res, 429, { ok: false, reason: '检索过于频繁，请稍候再试（每分钟上限 30 次）' }, cors);
    }
    if (inflight >= MAX_INFLIGHT) {
      return json(res, 503, { ok: false, reason: '当前检索请求较多，请稍后重试' }, cors);
    }

    inflight += 1;
    try {
      const data = await searchShidian(q);
      return json(res, 200, data, cors);
    } catch (e) {
      return json(
        res,
        502,
        { ok: false, reason: String((e && e.message) || e), officialUrl: `https://www.shidianguji.com/search/${encodeURIComponent(q)}` },
        cors
      );
    } finally {
      inflight -= 1;
    }
  }

  if (u.pathname === '/' || u.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

function json(res, code, obj, extra = {}) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', ...extra });
  res.end(JSON.stringify(obj));
}

server.listen(PORT, HOST, () => {
  console.log(`识典古籍检索工具已启动: http://localhost:${PORT} (bind ${HOST})`);
});
