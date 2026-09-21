import './calendar.css';

// calendar.js —— 糖果风格日历学习页
// 显示所选年份 1-12 月的迷你日历，支持通过箭头 / 直接输入修改年份。

const MONTH_NAMES = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
// 与时钟页数字同色系，12 个月各一个糖果色
const MONTH_COLORS = [
  '#ff6fa5', '#ffb703', '#79e6bd', '#8fd8ff',
  '#b497f5', '#ff8fab', '#4bb8f0', '#4fd39a',
  '#f7a600', '#c084fc', '#ff9770', '#5ed3b8',
];
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// ---------- 飘浮装饰 ----------
const decorations = [
  { emoji: '📅', top: '12%', left: '6%', size: 32, cls: '' },
  { emoji: '🗓️', top: '18%', left: '90%', size: 30, cls: 'rev' },
  { emoji: '🌈', top: '76%', left: '6%', size: 34, cls: 'slow' },
  { emoji: '⭐', top: '82%', left: '90%', size: 28, cls: 'rev' },
  { emoji: '🍭', top: '6%', left: '48%', size: 26, cls: 'slow rev' },
  { emoji: '✨', top: '90%', left: '42%', size: 22, cls: '' },
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
const app = document.getElementById('app');
app.innerHTML = `
  <div class="title">🗓️ 糖果日历乐园</div>
  <div class="subtitle">看看一年 12 个月，每个月有多少天呀？</div>

  <div class="year-bar">
    <button class="year-btn" id="prevYear" aria-label="上一年">◀</button>
    <div class="year-edit">
      <input class="year-input" id="yearInput" type="number" inputmode="numeric" value="" />
      <span class="year-unit">年</span>
    </div>
    <button class="year-btn" id="nextYear" aria-label="下一年">▶</button>
    <button class="today-btn" id="todayBtn">🎈 今年</button>
  </div>

  <div class="months" id="months"></div>

  <a class="back-link" href="../clock/">🕐 回到时钟</a>
`;

// ---------- 状态与渲染 ----------
const monthsEl = document.getElementById('months');
const yearInput = document.getElementById('yearInput');
let year = new Date().getFullYear();

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function monthGrid(y, m) {
  const total = daysInMonth(y, m);
  const first = new Date(y, m - 1, 1).getDay(); // 0=周日
  const today = new Date();
  const isCur = today.getFullYear() === y && today.getMonth() + 1 === m;

  let cells = '';
  for (let i = 0; i < first; i++) cells += `<div class="day empty"></div>`;
  for (let d = 1; d <= total; d++) {
    const cls = [];
    const wd = (first + d - 1) % 7;
    if (wd === 0 || wd === 6) cls.push('weekend'); // 周六/周日
    if (isCur && d === today.getDate()) cls.push('today');
    cells += `<div class="day ${cls.join(' ')}">${d}</div>`;
  }

  const headNote =
    m === 2 && isLeap(y) ? '29 天 · 闰年' : m === 2 ? '28 天' : `${total} 天`;
  const dow = WEEKDAYS.map((w) => `<div class="dow">${w}</div>`).join('');

  return `
    <div class="month-card">
      <div class="month-head" style="background:${MONTH_COLORS[m - 1]}">
        <span>${MONTH_NAMES[m - 1]}</span>
        <span class="days">${headNote}</span>
      </div>
      <div class="cal-week dow">${dow}</div>
      <div class="cal-days">${cells}</div>
    </div>
  `;
}

function render() {
  yearInput.value = year;
  let html = '';
  for (let m = 1; m <= 12; m++) html += monthGrid(year, m);
  monthsEl.innerHTML = html;
}

// ---------- 年份控制 ----------
document.getElementById('prevYear').onclick = () => { year -= 1; render(); };
document.getElementById('nextYear').onclick = () => { year += 1; render(); };
document.getElementById('todayBtn').onclick = () => {
  year = new Date().getFullYear();
  render();
};
yearInput.addEventListener('change', () => {
  const v = parseInt(yearInput.value, 10);
  if (Number.isFinite(v) && v >= 1 && v <= 9999) year = v;
  render();
});
yearInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') yearInput.blur();
});

render();
