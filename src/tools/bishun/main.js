import './bishun.css';

/* =========================================================
   笔顺小屋
   数据：hanzi-writer-data（笔画轮廓 path + 笔迹中线 median）
   坐标系：1024×1024，y 轴向上；屏幕 y = 900 - 数据 y
   ========================================================= */
(function(){
  'use strict';

  const VIEW = 1024, BASE = 900;
  const C = { ink:'#31394d', red:'#ef4444', ghost:'#e4eaf3' };

  const CDN = [
    c => 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/' + encodeURIComponent(c) + '.json',
    c => 'https://fastly.jsdelivr.net/npm/hanzi-writer-data@2.0.1/' + encodeURIComponent(c) + '.json',
    c => 'https://unpkg.com/hanzi-writer-data@2.0.1/' + encodeURIComponent(c) + '.json',
    c => 'https://registry.npmmirror.com/hanzi-writer-data/2.0.1/files/' + encodeURIComponent(c) + '.json'
  ];

  const SPEEDS = { slow:{dur:950, gap:260}, normal:{dur:600, gap:170}, fast:{dur:340, gap:90} };

  const EX = ['一','二','人','大','小','上','下','口','日','月','木','火','水','山','手','目','田','天'];

  const $ = id => document.getElementById(id);
  const el = {
    input:$('charInput'), go:$('goBtn'), chips:$('chips'),
    loading:$('loading'), loadingTxt:$('loadingTxt'), content:$('content'),
    stageBox:$('stageBox'), stageInfo:$('stageInfo'),
    play:$('playBtn'), prev:$('prevBtn'), next:$('nextBtn'), speed:$('speed'),
    grid:$('grid'), stepsInfo:$('stepsInfo'), save:$('saveBtn'),
    gameBox:$('gameBox'), gameStart:$('gameStart'), gameReset:$('gameReset'),
    statOk:$('statOk'), statAll:$('statAll'), statBad:$('statBad'),
    stars:$('stars'), msg:$('gameMsg'), gameMsg:$('gameMsg'), toast:$('toast')
  };

  const state = { char:'', data:null, maskSeq:0, token:0, playing:false, step:0, speed:'normal', busy:false };
  const game  = { active:false, picked:0, bad:0, t0:0, timer:0 };

  /* ---------------- 工具 ---------------- */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const isHan = ch => /[\u4e00-\u9fff]/.test(ch);

  function toast(msg, ms){
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.toast.classList.remove('show'), ms || 2200);
  }

  function medianPath(pts){
    let d = '';
    for (let i = 0; i < pts.length; i++){
      d += (i ? 'L' : 'M') + fmt(pts[i][0]) + ' ' + fmt(pts[i][1]);
    }
    return d;
  }
  const fmt = n => (Math.round(n * 10) / 10);

  /* ---------------- 数据获取 ---------------- */
  async function fetchData(ch){
    const key = 'bishun:v1:' + ch;
    try {
      const hit = localStorage.getItem(key);
      if (hit) return JSON.parse(hit);
    } catch(e){}

    let lastErr = null;
    for (const mk of CDN){
      try {
        const res = await fetch(mk(ch), { cache:'force-cache' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        if (!json || !json.strokes || !json.strokes.length) throw new Error('bad data');
        try { localStorage.setItem(key, JSON.stringify(json)); } catch(e){}
        return json;
      } catch(e){ lastErr = e; }
    }
    throw lastErr || new Error('网络不可用');
  }

  /* ---------------- SVG 生成 ---------------- */
  function tianzige(strong){
    const pad = 26, s = VIEW - pad * 2, c = VIEW / 2, e = 8;
    const line = strong ? '#efa9a9' : '#f7dadb';
    const frame = strong ? '#e28c8c' : '#f0c9cb';
    return '<rect x="' + pad + '" y="' + pad + '" width="' + s + '" height="' + s + '" rx="22" fill="#fff" stroke="' + frame + '" stroke-width="5"/>'
      + '<g stroke="' + line + '" stroke-width="3" stroke-dasharray="15 13" stroke-linecap="round">'
      + '<line x1="' + c + '" y1="' + (pad + e) + '" x2="' + c + '" y2="' + (VIEW - pad - e) + '"/>'
      + '<line x1="' + (pad + e) + '" y1="' + c + '" x2="' + (VIEW - pad - e) + '" y2="' + c + '"/>'
      + '</g>';
  }

  function startMarker(median){
    const sx = median[0][0], sy = BASE - median[0][1];
    let tx = sx, ty = sy;
    for (let i = 1; i < median.length; i++){
      const px = median[i][0], py = BASE - median[i][1];
      if (Math.hypot(px - sx, py - sy) > 55){ tx = px; ty = py; break; }
    }
    let ux = tx - sx, uy = ty - sy;
    const len = Math.hypot(ux, uy) || 1;
    ux /= len; uy /= len;
    const px = -uy, py = ux;
    const tip = 142, base = 74, w = 46;
    const t1 = (sx + ux * tip) + ',' + (sy + uy * tip);
    const t2 = (sx + ux * base + px * w) + ',' + (sy + uy * base + py * w);
    const t3 = (sx + ux * base - px * w) + ',' + (sy + uy * base - py * w);
    return '<g opacity=".95">'
      + '<polygon points="' + t1 + ' ' + t2 + ' ' + t3 + '" fill="#22c55e" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>'
      + '<circle cx="' + sx + '" cy="' + sy + '" r="30" fill="#16a34a" stroke="#fff" stroke-width="8"/>'
      + '</g>';
  }

  /**
   * 生成一个字的 SVG
   * o.done    已完成笔数（这些笔是黑色）
   * o.current 当前笔（红色）；-1 表示无
   * o.animate 当前笔做“书写”动画
   * o.ghost   是否显示未写的浅灰底稿
   * o.marker  显示起笔标记的笔序号
   * o.strong  田字格用深色
   */
  function buildSvg(o){
    const st = state.data.strokes, md = state.data.medians;
    const n = st.length;
    const done = o.done || 0, cur = (o.current === undefined ? -1 : o.current);
    const ghost = o.ghost !== false;
    const grays = [], inks = [];
    for (let i = 0; i < n; i++){
      if (i === cur) continue;
      if (i < done) inks.push('<path d="' + st[i] + '" style="fill:' + C.ink + '"/>');
      else if (ghost) grays.push('<path d="' + st[i] + '" style="fill:' + C.ghost + '"/>');
    }
    let defs = '', curPath = '';
    if (cur >= 0){
      if (o.animate && md[cur]){
        const uid = 'msk' + (++state.maskSeq);
        const dur = SPEEDS[state.speed].dur;
        defs = '<defs><mask id="' + uid + '" maskUnits="userSpaceOnUse" x="-400" y="-400" width="1824" height="1824">'
          + '<path d="' + medianPath(md[cur]) + '" fill="none" stroke="#fff" stroke-width="330" '
          + 'stroke-linecap="round" stroke-linejoin="round" pathLength="1" '
          + 'style="stroke-dasharray:1 1;stroke-dashoffset:1;transition:stroke-dashoffset ' + dur + 'ms linear"/></mask></defs>';
        curPath = '<path d="' + st[cur] + '" mask="url(#' + uid + ')" style="fill:' + C.red + '"/>';
      } else {
        curPath = '<path d="' + st[cur] + '" style="fill:' + C.red + '"/>';
      }
    }
    const mark = (o.marker != null && o.marker >= 0 && md[o.marker]) ? startMarker(md[o.marker]) : '';
    return '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">' + defs + tianzige(o.strong)
      + '<g transform="translate(0,' + BASE + ') scale(1,-1)">' + grays.join('') + inks.join('') + curPath + '</g>'
      + mark + '</svg>';
  }

  /* ---------------- 渲染主图 ---------------- */
  function renderStage(o){
    el.stageBox.innerHTML = buildSvg(o);
    if (o.animate && o.current >= 0){
      const mp = el.stageBox.querySelector('mask path');
      if (mp) requestAnimationFrame(() => requestAnimationFrame(() => { mp.style.strokeDashoffset = '0'; }));
    }
    const n = state.data.strokes.length;
    if (o.current >= 0) el.stageInfo.textContent = '第 ' + (o.current + 1) + ' 笔 / 共 ' + n + ' 笔';
    else if ((o.done || 0) >= n) el.stageInfo.textContent = '共 ' + n + ' 笔 · 写完啦';
    else el.stageInfo.textContent = '共 ' + n + ' 笔';
  }

  function highlightCard(k){
    Array.prototype.forEach.call(el.grid.children, (c, i) => c.classList.toggle('on', i === k));
  }

  /* ---------------- 播放 ---------------- */
  async function play(from){
    const n = state.data.strokes.length;
    const token = ++state.token;
    state.playing = true;
    syncBtns();
    for (let k = (from || 0); k < n; k++){
      if (token !== state.token) return;
      state.step = k;
      renderStage({ done:k, current:k, animate:true, marker:k });
      highlightCard(k);
      await sleep(SPEEDS[state.speed].dur + SPEEDS[state.speed].gap);
      if (token !== state.token) return;
    }
    if (token !== state.token) return;
    state.step = n - 1;
    renderStage({ done:n, current:-1 });
    highlightCard(-1);
    state.playing = false;
    syncBtns();
  }

  function stop(){
    state.token++;
    state.playing = false;
    syncBtns();
  }

  function jumpTo(k, silence){
    const n = state.data.strokes.length;
    if (k < 0 || k >= n) return;
    stop();
    state.step = k;
    renderStage({ done:k, current:k, marker:k });
    highlightCard(k);
    if (!silence) syncBtns();
  }

  function syncBtns(){
    const n = state.data ? state.data.strokes.length : 0;
    el.play.disabled = !state.data;
    el.play.textContent = state.playing ? '⏸ 停' : (state.step >= n - 1 && !state.playing ? '↻ 重播' : '▶ 播放');
    el.prev.disabled = !state.data || state.step <= 0;
    el.next.disabled = !state.data || state.step >= n - 1;
  }

  /* ---------------- 分解卡片 ---------------- */
  function colsFor(n){ return n <= 4 ? n : (n <= 12 ? 4 : (n <= 20 ? 5 : 6)); }

  function renderSteps(){
    const n = state.data.strokes.length;
    el.grid.style.setProperty('--cols', colsFor(n));
    let html = '';
    for (let k = 0; k < n; k++){
      html += '<div class="step" data-k="' + k + '"><div class="num">' + (k + 1) + '</div>'
        + buildSvg({ done:k, current:k, ghost:true, marker:-1, strong:false }) + '</div>';
    }
    el.grid.innerHTML = html;
    el.stepsInfo.textContent = '按顺序排列 · 红色是第几笔，共 ' + n + ' 笔';
  }

  el.grid.addEventListener('click', e => {
    const card = e.target.closest('.step');
    if (!card) return;
    jumpTo(+card.dataset.k);
  });

  /* ---------------- 游戏 ---------------- */
  function renderGame(lastIdx){
    const st = state.data.strokes, md = state.data.medians;
    const n = st.length;
    const parts = [];
    for (let i = 0; i < n; i++){
      const on = i < game.picked;
      parts.push('<path d="' + st[i] + '" style="fill:' + (on ? C.ink : C.ghost) + '"/>');
    }
    let hot = '';
    if (game.active){
      for (let i = game.picked; i < n; i++){
        hot += '<path d="' + medianPath(md[i]) + '" data-idx="' + i + '" fill="none" stroke="rgba(0,0,0,0)" '
          + 'stroke-width="170" stroke-linecap="round" pointer-events="stroke" style="cursor:pointer"/>';
      }
    }
    el.gameBox.innerHTML = '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">' + tianzige(true)
      + '<g transform="translate(0,' + BASE + ') scale(1,-1)">' + parts.join('') + hot + '</g></svg>';
    el.statOk.textContent = game.picked;
    el.statAll.textContent = n;
    el.statBad.textContent = game.bad;
    el.stars.textContent = game.picked ? '⭐'.repeat(Math.min(game.picked, 12)) : '';
    if (lastIdx != null && lastIdx >= 0 && md[lastIdx]){
      // 提示刚点亮的那一笔的起笔位置
      const svg = el.gameBox.querySelector('svg');
      if (svg) svg.insertAdjacentHTML('beforeend', startMarker(md[lastIdx]));
    }
  }

  function startGame(){
    if (!state.data) return;
    stop();
    game.active = true; game.picked = 0; game.bad = 0;
    game.t0 = Date.now();
    game.timer = setInterval(() => {
      if (!game.active) return;
      el.msg.className = 'msg plain';
      el.msg.textContent = '加油！已经 ' + Math.round((Date.now() - game.t0) / 1000) + ' 秒啦';
    }, 1000);
    el.msg.className = 'msg plain';
    el.msg.textContent = '按笔顺点笔画吧，点对了会变黑哦～';
    renderGame();
  }

  function endGame(){
    game.active = false;
    clearInterval(game.timer);
    const sec = Math.round((Date.now() - game.t0) / 1000);
    el.msg.className = 'msg ok';
    el.msg.textContent = '🎉 全部正确！用时 ' + sec + ' 秒，点错 ' + game.bad + ' 次';
    confetti(el.gameBox);
    renderGame();
  }

  el.gameBox.addEventListener('click', e => {
    if (!game.active) return;
    const p = e.target.closest ? e.target.closest('path[data-idx]') : null;
    if (!p) return;
    const i = +p.dataset.idx;
    const n = state.data.strokes.length;
    if (i === game.picked){
      game.picked++;
      renderGame(i);
      if (game.picked >= n) endGame();
      else { el.msg.className = 'msg ok'; el.msg.textContent = '✅ 第 ' + game.picked + ' 笔，正确！'; }
    } else {
      game.bad++;
      el.statBad.textContent = game.bad;
      el.msg.className = 'msg no';
      el.msg.textContent = '❌ 不对哦，再想想第 ' + (game.picked + 1) + ' 笔是哪一笔～';
      el.gameBox.classList.remove('shake');
      void el.gameBox.offsetWidth;
      el.gameBox.classList.add('shake');
      setTimeout(() => el.gameBox.classList.remove('shake'), 420);
    }
  });

  function confetti(host){
    const rect = host.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const icons = ['⭐','🎉','✨','🌟','🎊'];
    for (let i = 0; i < 22; i++){
      const s = document.createElement('span');
      s.className = 'fly';
      s.textContent = icons[i % icons.length];
      const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 170;
      s.style.left = cx + 'px'; s.style.top = cy + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d - 60 + 'px');
      s.style.setProperty('--rot', (Math.random() * 260 - 130) + 'deg');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1200);
    }
  }

  /* ---------------- 导出笔顺图 ---------------- */
  function exportPNG(){
    if (!state.data) return;
    const st = state.data.strokes, md = state.data.medians;
    const n = st.length;
    const cols = colsFor(n), rows = Math.ceil(n / cols);
    const cell = 250, gap = 18, pad = 30, head = 96;
    const W = pad * 2 + cols * cell + (cols - 1) * gap;
    const H = head + rows * cell + (rows - 1) * gap + pad;
    const S = 2; // 高清 2 倍

    const cv = document.createElement('canvas');
    cv.width = W * S; cv.height = H * S;
    const ctx = cv.getContext('2d');
    ctx.scale(S, S);

    // 背景
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#f7fbff'); g.addColorStop(1, '#fff7f0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // 标题
    ctx.fillStyle = '#1e2a3a';
    ctx.font = '700 34px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('「' + state.char + '」笔顺图', pad, head * 0.5);
    ctx.font = '16px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
    ctx.fillStyle = '#7b8aa0';
    ctx.textAlign = 'right';
    ctx.fillText('共 ' + n + ' 笔 · 红色为第几笔', W - pad, head * 0.5 + 4);

    const paths = st.map(d => new Path2D(d));

    for (let k = 0; k < n; k++){
      const r = Math.floor(k / cols), c = k % cols;
      const x0 = pad + c * (cell + gap), y0 = head + r * (cell + gap);
      const s = cell / VIEW;

      // 格子底
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x0, y0, cell, cell, 20); else ctx.rect(x0, y0, cell, cell);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.strokeStyle = '#eec4c4'; ctx.lineWidth = 4; ctx.stroke();
      // 田字格虚线
      ctx.setLineDash([10, 9]); ctx.strokeStyle = '#f3d2d2'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0 + cell / 2, y0 + 10); ctx.lineTo(x0 + cell / 2, y0 + cell - 10);
      ctx.moveTo(x0 + 10, y0 + cell / 2); ctx.lineTo(x0 + cell - 10, y0 + cell / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 笔画
      const seq = [];
      for (let i = n - 1; i >= 0; i--) if (i >= k) seq.push(i);
      for (let i = 0; i < k; i++) seq.push(i);
      for (const i of seq){
        ctx.save();
        ctx.translate(x0, y0);
        ctx.scale(s, s);
        ctx.translate(0, BASE);
        ctx.scale(1, -1);
        ctx.fillStyle = (i === k) ? C.red : (i < k ? C.ink : C.ghost);
        ctx.fill(paths[i]);
        ctx.restore();
      }

      // 序号
      ctx.beginPath();
      ctx.arc(x0 + 3, y0 + 3, 19, 0, Math.PI * 2);
      ctx.fillStyle = '#ff8a3d'; ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 21px "PingFang SC",system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(k + 1), x0 + 3, y0 + 4);
    }

    // 底部小字
    ctx.fillStyle = '#aab6c8';
    ctx.font = '14px "PingFang SC",system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('笔顺小屋 · 写好每一笔', W / 2, H - pad * 0.6);

    cv.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '笔顺-' + state.char + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      toast('笔顺图已保存到「下载」文件夹');
    }, 'image/png');
  }

  /* ---------------- 主流程 ---------------- */
  async function generate(ch){
    if (!ch || !isHan(ch)) { toast('请输入一个汉字哦～'); return; }
    if (state.busy) return;
    state.busy = true;
    stop();
    state.char = ch;
    el.loading.classList.remove('hidden');
    el.content.classList.add('hidden');
    el.loadingTxt.textContent = '正在取「' + ch + '」的笔顺数据…';
    try {
      const data = await fetchData(ch);
      state.data = data;
      state.step = 0;
      el.loading.classList.add('hidden');
      el.content.classList.remove('hidden');
      renderStage({ done:0, current:0, marker:0 });
      renderSteps();
      highlightCard(0);
      syncBtns();
      game.active = false; game.picked = 0; game.bad = 0;
      clearInterval(game.timer);
      el.msg.className = 'msg plain';
      el.msg.textContent = '点「开始挑战」，然后按笔顺点笔画。';
      renderGame();
      // 大图回到完整显示
      renderStage({ done:data.strokes.length, current:-1 });
      highlightCard(-1);
    } catch(err){
      console.error('[笔顺小屋] 生成失败：', err);
      el.loading.classList.add('hidden');
      el.content.classList.add('hidden');
      toast('取不到「' + ch + '」的笔顺数据，检查一下网络，或换一个字试试', 3200);
    } finally {
      state.busy = false;
    }
  }

  /* ---------------- 事件 ---------------- */
  el.go.addEventListener('click', () => generate(el.input.value.trim().slice(0, 1)));
  el.input.addEventListener('keydown', e => { if (e.key === 'Enter') el.go.click(); });
  el.input.addEventListener('input', () => {
    const v = el.input.value.replace(/[^\u4e00-\u9fff]/g, '');
    if (v !== el.input.value) el.input.value = v;
  });

  const EXAMPLES = EX;
  EXAMPLES.forEach(ch => {
    const b = document.createElement('button');
    b.className = 'chip'; b.textContent = ch;
    b.addEventListener('click', () => { el.input.value = ch; generate(ch); });
    el.chips.appendChild(b);
  });

  el.play.addEventListener('click', () => {
    if (state.playing) { stop(); renderStage({ done:state.step, current:state.step, marker:state.step }); highlightCard(state.step); return; }
    const n = state.data.strokes.length;
    play(state.step >= n - 1 ? 0 : state.step);
  });
  el.prev.addEventListener('click', () => jumpTo(state.step - 1));
  el.next.addEventListener('click', () => jumpTo(state.step + 1));
  el.speed.addEventListener('click', e => {
    const b = e.target.closest('button[data-sp]');
    if (!b) return;
    state.speed = b.dataset.sp;
    Array.prototype.forEach.call(el.speed.children, x => x.classList.toggle('on', x === b));
  });
  el.save.addEventListener('click', exportPNG);
  el.gameStart.addEventListener('click', startGame);
  el.gameReset.addEventListener('click', () => {
    if (!state.data) return;
    clearInterval(game.timer);
    game.active = false; game.picked = 0; game.bad = 0;
    el.msg.className = 'msg plain';
    el.msg.textContent = '点「开始挑战」，然后按笔顺点笔画。';
    renderGame();
  });

  document.addEventListener('keydown', e => {
    if (document.activeElement === el.input) return;
    if (!state.data) return;
    if (e.key === 'ArrowLeft') jumpTo(state.step - 1);
    if (e.key === 'ArrowRight') jumpTo(state.step + 1);
    if (e.key === ' ') { e.preventDefault(); el.play.click(); }
  });

  // 打开就送一个字，别让小朋友面对空白页
  el.input.value = '大';
  generate('大');
})();
