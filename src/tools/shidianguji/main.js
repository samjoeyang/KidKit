import './shidianguji.css';

const EXAMPLES = ['史记', '資治通鑑', '漢書', '貞觀政要', '王安石', '論語', '水經注', '明史'];
const OFFICIAL = 'https://www.shidianguji.com';

const qEl = document.getElementById('q');
const mainEl = document.getElementById('main');
const bannerEl = document.getElementById('banner');
const examplesEl = document.getElementById('examples');

EXAMPLES.forEach((w) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = w;
  b.addEventListener('click', () => example(w));
  examplesEl.appendChild(b);
});

function example(w) {
  qEl.value = w;
  doSearch();
}

let lastQuery = '';
let PROXY_OK = false; // 后端代理是否可用（静态打开时为 false）

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function showBanner(html) {
  bannerEl.innerHTML = html;
  bannerEl.classList.add('show');
}

function officialSearch(q) {
  window.open(OFFICIAL + '/search/' + encodeURIComponent(q), '_blank');
}

// 启动时探测后端代理是否可用
async function probeProxy() {
  try {
    const r = await fetch('/api/health', { cache: 'no-store' });
    if (!r.ok) throw new Error('no proxy');
    const d = JSON.parse(await r.text());
    if (d && d.ok) {
      PROXY_OK = true;
      return;
    }
    throw new Error('bad health');
  } catch {
    PROXY_OK = false;
    const here = location.protocol === 'file:' ? '本地文件' : location.origin;
    showBanner(
      '⚠️ 当前页面（' + esc(here) + '）没有连接到检索后端，只能作为「跳转官网」使用。<br>' +
        '请通过本地服务地址打开本工具（在项目根目录执行 <code>npm run dev</code> 或 <code>npm run preview</code>）。<br>' +
        '仍可在此输入关键词，Enter 将直接在识典古籍官网检索。'
    );
  }
}

async function apiSearch(q) {
  const r = await fetch('/api/search?q=' + encodeURIComponent(q), { cache: 'no-store' });
  const raw = await r.text();
  if (!raw) throw new Error('EMPTY_RESPONSE');
  let d;
  try {
    d = JSON.parse(raw);
  } catch {
    throw new Error('EMPTY_RESPONSE');
  }
  return d;
}

function highlight(text, words) {
  let html = esc(text);
  for (const w of words) {
    if (!w) continue;
    const parts = html.split(esc(w));
    html = parts.join('<mark>' + esc(w) + '</mark>');
  }
  return html;
}

async function doSearch() {
  const q = qEl.value.trim();
  if (!q) return;
  lastQuery = q;

  if (!PROXY_OK) {
    showBanner(
      '静态模式：已在新标签页打开识典古籍官网检索「' + esc(q) + '」。' +
        '要使用本工具的整合结果视图，请通过本地服务打开本项目（<code>npm run dev</code>）。'
    );
    officialSearch(q);
    return;
  }

  mainEl.innerHTML = '<div class="status">正在翻检书海……</div>';
  window.scrollTo({ top: 0 });
  try {
    const d = await apiSearch(q);
    if (!d.ok) {
      mainEl.innerHTML =
        '<div class="status"><span class="err">检索失败：</span>' + esc(d.reason || '未知原因') +
        '<br>可稍后重试，或直接前往 <a href="' + (d.officialUrl || OFFICIAL) +
        '" target="_blank" style="color:var(--cinnabar)">识典古籍官网</a></div>';
      return;
    }
    render(d);
  } catch (e) {
    if (String(e.message) === 'EMPTY_RESPONSE') {
      // 后端不在了（多为静态副本打开），降级为官网检索
      PROXY_OK = false;
      showBanner('⚠️ 未检测到检索后端，已切换为「跳转官网」模式。');
      officialSearch(q);
      mainEl.innerHTML = '<div class="status">已在新标签页打开识典古籍官网检索「' + esc(q) + '」。</div>';
      return;
    }
    mainEl.innerHTML =
      '<div class="status"><span class="err">网络异常：</span>' + esc(String(e.message || e)) +
      '<br>请确认本地服务仍在运行，或 <a href="' + OFFICIAL + '/search/' + encodeURIComponent(q) +
      '" target="_blank" style="color:var(--cinnabar)">前往官网检索</a>。</div>';
  }
}

function render(d) {
  const words = (d.segments || []).concat(d.phrases || []);
  let html = '';

  html += '<div class="meta"><b>「' + esc(d.query) + '」</b>';
  if (d.correctedText && d.correctedText !== d.query) {
    html += '<span class="corrected">已为您显示：' + esc(d.correctedText) + '</span>';
  }
  html += '<span>约 <span class="total">' + d.total + '</span> 条出处</span>';
  html +=
    '<span style="margin-left:auto"><a class="match" href="' + d.officialUrl +
    '" target="_blank">在官网查看全部 →</a></span></div>';

  if (!d.paragraphs.length) {
    html += '<div class="status">未检得条目，可尝试更换关键词或使用繁体字。</div>';
  }

  d.paragraphs.forEach((p, i) => {
    html +=
      '<div class="card">' +
      '<div class="bookline">' +
      '<span class="bookname">' + esc(p.bookName) + '</span>' +
      (p.edition ? '<span class="edition">' + esc(p.editionDynasty) + '·' + esc(p.edition) + '</span>' : '') +
      '<span class="authors">' + esc(p.authors.join('；')) + '</span>' +
      (p.perfectMatch ? '<span class="match">✦ 精确匹配</span>' : '') +
      '</div>' +
      (p.chapter ? '<div class="chapter">' + esc(p.chapter) + '</div>' : '') +
      '<div class="text">' + highlight(p.text, words) + '</div>' +
      '<div class="foot"><a href="' + p.url + '" target="_blank">前往原书阅读 →</a>' +
      '<span class="match">出处 ' + (i + 1) + '</span></div>' +
      '</div>';
  });

  if (d.recommends && d.recommends.length) {
    html += '<div class="reco"><h2>相关典籍</h2><div class="reco-grid">';
    d.recommends.forEach((b) => {
      html +=
        '<a href="' + b.url + '" target="_blank"><div class="rn">' + esc(b.bookName) + '</div>' +
        '<div class="ra">' + esc(b.authors || '佚名') + '</div></a>';
    });
    html += '</div></div>';
  }

  mainEl.innerHTML = html;
}

// ---------- 事件绑定（模块作用域下不能再用内联 onclick）----------
document.getElementById('searchBtn').addEventListener('click', () => doSearch());
qEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doSearch();
});
document.getElementById('quoteHint').addEventListener('click', (e) => {
  e.preventDefault();
  example('"貞觀之治"');
});

// 启动：探测后端 + 支持 ?q=关键词 直接检索（便于分享链接）
async function boot() {
  const preset = new URLSearchParams(location.search).get('q');
  if (preset) qEl.value = preset;
  await probeProxy();
  if (preset) doSearch();
}
boot();
