import './clock.css';
import Clock from './Clock.js';

const app = document.getElementById('app');

// ---------- 背景装饰（云朵 / 星星 / 棒棒糖）----------
const decorations = [
  { emoji: '☁️', top: '6%', left: '6%', size: 46, cls: 'slow' },
  { emoji: '⭐', top: '14%', left: '86%', size: 30, cls: '' },
  { emoji: '🍬', top: '78%', left: '8%', size: 34, cls: 'rev' },
  { emoji: '🍭', top: '70%', left: '88%', size: 40, cls: 'slow rev' },
  { emoji: '☁️', top: '88%', left: '50%', size: 38, cls: '' },
  { emoji: '✨', top: '4%', left: '42%', size: 22, cls: 'rev' },
];
decorations.forEach((d) => {
  const el = document.createElement('div');
  el.className = `deco ${d.cls}`;
  el.style.top = d.top;
  el.style.left = d.left;
  el.style.fontSize = d.size + 'px';
  el.textContent = d.emoji;
  document.body.appendChild(el);
});

// ---------- 页面骨架 ----------
app.innerHTML = `
  <div class="title">🕐 糖果时间乐园</div>
  <div class="subtitle">拖一拖指针，认识时钟啦！</div>

  <div class="nav-jump"><a class="jump-link" href="../calendar/">🗓️ 学日历</a></div>

  <div class="mode-switch">
    <button class="mode-btn" data-mode="challenge">🎯 认表挑战</button>
    <button class="mode-btn" data-mode="free">🎨 自由拨表</button>
  </div>

  <div class="card">
    <div class="prompt-bubble" id="prompt"></div>
    <div class="clock-wrap" id="clockWrap"></div>
    <div class="digital-display" id="digital">--<span class="colon">:</span>--</div>
    <div class="actions" id="actions"></div>
    <div class="feedback empty" id="feedback"></div>
    <div class="stars" id="stars"></div>
  </div>

  <div class="footer-hint">💡 小提示：用手指或鼠标拖动时针、分针（自由模式还能拖秒针）就可以改变时间哦～</div>
`;

const promptEl = document.getElementById('prompt');
const digitalEl = document.getElementById('digital');
const actionsEl = document.getElementById('actions');
const feedbackEl = document.getElementById('feedback');
const starsEl = document.getElementById('stars');
const clockWrap = document.getElementById('clockWrap');
const modeBtns = [...document.querySelectorAll('.mode-btn')];

// ---------- 中文读法辅助 ----------
const CN_NUM = ['零','一','二','三','四','五','六','七','八','九','十','十一','十二',
  '十三','十四','十五','十六','十七','十八','十九','二十','二十一','二十二','二十三','二十四',
  '二十五','二十六','二十七','二十八','二十九','三十','三十一','三十二','三十三','三十四','三十五',
  '三十六','三十七','三十八','三十九','四十','四十一','四十二','四十三','四十四','四十五','四十六',
  '四十七','四十八','四十九','五十','五十一','五十二','五十三','五十四','五十五','五十六','五十七',
  '五十八','五十九'];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function readTimeCN(h, m) {
  if (m === 0) return `${CN_NUM[h]}点整`;
  return `${CN_NUM[h]}点${CN_NUM[m]}分`;
}

function updateDigital(h, m, s) {
  digitalEl.innerHTML = `${pad2(h)}<span class="colon">:</span>${pad2(m)}${
    s !== undefined ? `<span class="colon">:</span>${pad2(s)}` : ''
  }`;
}

// ---------- 状态 ----------
let mode = 'challenge';
let target = { hour: 3, minute: 0 };
let score = 0;
let asked = 0;

// ---------- 时钟实例 ----------
const clock = new Clock(clockWrap, {
  initial: { hour: 12, minute: 0, second: 0 },
  interactive: { hour: true, minute: true, second: true },
  showSecond: true,
  onChange: (t) => {
    updateDigital(t.hour === 12 ? 12 : t.hour, t.minute, mode === 'free' ? t.second : undefined);
    if (mode === 'challenge') clearFeedback();
  },
});

function clearFeedback() {
  feedbackEl.className = 'feedback empty';
  feedbackEl.textContent = '';
}

function setFeedback(text, type) {
  feedbackEl.className = `feedback ${type}`;
  feedbackEl.textContent = text;
}

function updateStars() {
  const full = Math.min(score, 8);
  starsEl.textContent = score === 0 ? '' : '⭐'.repeat(full) + (score > 8 ? ` x${score}` : '');
}

// ---------- 挑战模式 ----------
function newChallenge() {
  const h = 1 + Math.floor(Math.random() * 12);
  const m = Math.floor(Math.random() * 12) * 5;
  target = { hour: h, minute: m };
  asked += 1;

  // 起始指针放到一个和答案不同的位置，让孩子动手摆
  let startH = h;
  let startM = m;
  while (startH === h && startM === m) {
    startH = 1 + Math.floor(Math.random() * 12);
    startM = Math.floor(Math.random() * 12) * 5;
  }
  clock.setInteractive({ hour: true, minute: true, second: false });
  clock.setShowSecond(false);
  clock.setTime(startH, startM, 0);
  updateDigital(clock.getTime().hour, clock.getTime().minute);

  promptEl.innerHTML = `第 ${asked} 题：请把指针拨到 👇<span class="big-time">${pad2(h)}:${pad2(m)}</span>${readTimeCN(h, m)}`;
  clearFeedback();
}

function checkChallenge() {
  const t = clock.getTime();
  const hourOk = t.hour === target.hour;
  const minuteOk = t.minute === target.minute;
  if (hourOk && minuteOk) {
    score += 1;
    updateStars();
    setFeedback('🎉 太棒了，摆对啦！', 'correct');
    setTimeout(newChallenge, 1100);
  } else if (!hourOk && !minuteOk) {
    setFeedback('再看看，时针和分针都要挪一挪哦～', 'wrong');
  } else if (!hourOk) {
    setFeedback('分针对啦！时针还要再调一调～', 'wrong');
  } else {
    setFeedback('时针对啦！分针还要再调一调～', 'wrong');
  }
}

function renderChallengeActions() {
  actionsEl.innerHTML = `
    <button class="btn check" id="btnCheck">✅ 检查一下</button>
    <button class="btn next" id="btnNext">🔄 换一题</button>
  `;
  document.getElementById('btnCheck').onclick = checkChallenge;
  document.getElementById('btnNext').onclick = newChallenge;
}

// ---------- 自由模式 ----------
function renderFreeActions() {
  actionsEl.innerHTML = `
    <button class="btn random" id="btnRandom">🎲 随机时间</button>
    <button class="btn reset" id="btnReset">🏠 回到12点</button>
  `;
  document.getElementById('btnRandom').onclick = () => {
    const h = 1 + Math.floor(Math.random() * 12);
    const m = Math.floor(Math.random() * 60);
    const s = Math.floor(Math.random() * 60);
    clock.setTime(h, m, s);
    updateDigital(...Object.values(clock.getTime()));
  };
  document.getElementById('btnReset').onclick = () => {
    clock.setTime(12, 0, 0);
    updateDigital(12, 0, 0);
  };
}

function enterFree() {
  mode = 'free';
  clock.setInteractive({ hour: true, minute: true, second: true });
  clock.setShowSecond(true);
  const t = clock.getTime();
  updateDigital(t.hour, t.minute, t.second);
  promptEl.innerHTML = `自由拨表模式 🎨<br/>拖动三根指针，看看时间会怎么变化！`;
  clearFeedback();
  starsEl.textContent = '';
  renderFreeActions();
}

function enterChallenge() {
  mode = 'challenge';
  score = 0;
  asked = 0;
  updateStars();
  renderChallengeActions();
  newChallenge();
}

modeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    modeBtns.forEach((b) => b.classList.toggle('active', b === btn));
    if (btn.dataset.mode === 'challenge') enterChallenge();
    else enterFree();
  });
});

// 默认进入挑战模式
modeBtns[0].classList.add('active');
enterChallenge();
