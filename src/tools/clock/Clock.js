// Clock.js —— 糖果风格可拖拽圆形时钟组件
// 支持触摸/鼠标拖动时针、分针、秒针，并维护三者之间的进位/联动关系。

const NUM_COLORS = [
  '#ff6fa5', '#ffb703', '#79e6bd', '#8fd8ff',
  '#b497f5', '#ff8fab', '#4bb8f0', '#4fd39a',
  '#f7a600', '#c084fc', '#ff9770', '#5ed3b8',
];

const CENTER = 150;
const FACE_R = 138;

function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default class Clock {
  /**
   * @param {HTMLElement} container
   * @param {Object} opts
   * @param {{hour:number,minute:number,second:number}} [opts.initial]
   * @param {{hour:boolean,minute:boolean,second:boolean}} [opts.interactive]
   * @param {boolean} [opts.showSecond]
   * @param {(time:{hour:number,minute:number,second:number}, source:string)=>void} [opts.onChange]
   */
  constructor(container, opts = {}) {
    this.container = container;
    this.time = Object.assign({ hour: 3, minute: 0, second: 0 }, opts.initial);
    this.interactive = Object.assign(
      { hour: true, minute: true, second: true },
      opts.interactive
    );
    this.showSecond = opts.showSecond !== false;
    this.onChange = opts.onChange || (() => {});
    this.dragging = null; // 'hour' | 'minute' | 'second' | null

    this._buildDom();
    this._bindEvents();
    this.render();
  }

  // ---------- 对外 API ----------
  setTime(h, m, s = this.time.second) {
    this.time = {
      hour: ((h % 12) + 12) % 12 || 12,
      minute: ((m % 60) + 60) % 60,
      second: ((s % 60) + 60) % 60,
    };
    this.render();
  }

  getTime() {
    return { ...this.time };
  }

  setInteractive(map) {
    Object.assign(this.interactive, map);
    this._updateCursors();
  }

  setShowSecond(show) {
    this.showSecond = show;
    this.secondGroup.style.display = show ? '' : 'none';
  }

  randomize({ minuteStep = 5 } = {}) {
    const h = 1 + Math.floor(Math.random() * 12);
    const steps = 60 / minuteStep;
    const m = Math.floor(Math.random() * steps) * minuteStep;
    this.setTime(h, m, 0);
    return this.getTime();
  }

  destroy() {
    this.svg.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    this.container.innerHTML = '';
  }

  // ---------- 内部：构建 DOM ----------
  _buildDom() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 300 300');
    svg.setAttribute('class', 'clock-svg');
    this.svg = svg;

    // 表盘底
    const defs = document.createElementNS(svgNS, 'defs');
    defs.innerHTML = `
      <radialGradient id="faceGrad" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="75%" stop-color="#fff9fc"/>
        <stop offset="100%" stop-color="#ffe9f4"/>
      </radialGradient>
      <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff8fb3"/>
        <stop offset="100%" stop-color="#ff5f96"/>
      </linearGradient>
      <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c6a6ff"/>
        <stop offset="100%" stop-color="#9b6bf0"/>
      </linearGradient>
    `;
    svg.appendChild(defs);

    svg.appendChild(this._el('circle', { cx: CENTER, cy: CENTER, r: FACE_R + 8, fill: '#fff', opacity: '0.6' }));
    svg.appendChild(this._el('circle', { cx: CENTER, cy: CENTER, r: FACE_R, fill: 'url(#faceGrad)', stroke: '#ffd3e8', 'stroke-width': 6 }));
    svg.appendChild(this._el('circle', { cx: CENTER, cy: CENTER, r: FACE_R - 14, fill: 'none', stroke: '#ffe1f0', 'stroke-width': 2, 'stroke-dasharray': '4 8' }));

    // 分钟刻度 + 小时刻度 + 数字
    const ticks = document.createElementNS(svgNS, 'g');
    for (let i = 0; i < 60; i++) {
      const angle = i * 6;
      const isHour = i % 5 === 0;
      const p1 = polar(CENTER, CENTER, FACE_R - 10, angle);
      const p2 = polar(CENTER, CENTER, FACE_R - (isHour ? 24 : 16), angle);
      ticks.appendChild(
        this._el('line', {
          x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
          stroke: isHour ? '#ffb0cf' : '#ffe1ee',
          'stroke-width': isHour ? 4 : 2,
          'stroke-linecap': 'round',
        })
      );
    }
    svg.appendChild(ticks);

    const numbers = document.createElementNS(svgNS, 'g');
    for (let n = 1; n <= 12; n++) {
      const angle = n * 30;
      const p = polar(CENTER, CENTER, FACE_R - 40, angle);
      const t = this._el('text', {
        x: p.x, y: p.y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-family': 'Baloo 2, sans-serif', 'font-weight': '800',
        'font-size': '30', fill: NUM_COLORS[n - 1],
      });
      t.textContent = String(n);
      numbers.appendChild(t);
    }
    svg.appendChild(numbers);

    // 中心可爱笑脸（装饰）
    const face = document.createElementNS(svgNS, 'g');
    face.innerHTML = `
      <circle cx="132" cy="146" r="4.5" fill="#4a2e5c"/>
      <circle cx="168" cy="146" r="4.5" fill="#4a2e5c"/>
      <path d="M138 160 Q150 170 162 160" stroke="#4a2e5c" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <circle cx="122" cy="156" r="6" fill="#ffb0cf" opacity="0.7"/>
      <circle cx="178" cy="156" r="6" fill="#ffb0cf" opacity="0.7"/>
    `;
    svg.appendChild(face);

    // 指针
    this.hourGroup = this._buildHand({ length: 62, width: 11, color: 'url(#hourGrad)', type: 'hour' });
    this.minuteGroup = this._buildHand({ length: 96, width: 7.5, color: 'url(#minGrad)', type: 'minute' });
    this.secondGroup = this._buildHand({ length: 112, width: 3, color: '#4bb8f0', type: 'second', tail: 22 });
    svg.appendChild(this.hourGroup);
    svg.appendChild(this.minuteGroup);
    svg.appendChild(this.secondGroup);

    // 中心圆钉
    svg.appendChild(this._el('circle', { cx: CENTER, cy: CENTER, r: 10, fill: '#ffe066', stroke: '#4a2e5c', 'stroke-width': 2 }));
    svg.appendChild(this._el('circle', { cx: 147, cy: 147, r: 2.6, fill: '#fff', opacity: '0.9' }));

    this.container.innerHTML = '';
    this.container.appendChild(svg);
    this._updateCursors();
  }

  _buildHand({ length, width, color, type, tail = 0 }) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', `hand ${type}-hand`);
    g.dataset.hand = type;

    // 用细矩形画指针本体:竖直 <line> 的包围盒宽度为 0,
    // 会让 objectBoundingBox 渐变换算退化,导致 stroke 渐变在 Chrome 下不绘制。
    const visible = this._el('rect', {
      x: CENTER - width / 2, y: CENTER - length, width, height: length + tail,
      fill: color, rx: width / 2,
    });
    const hit = this._el('line', {
      x1: CENTER, y1: CENTER, x2: CENTER, y2: CENTER - length,
      class: 'hand-hit',
    });
    g.appendChild(visible);
    g.appendChild(hit);
    return g;
  }

  _el(tag, attrs) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const e = document.createElementNS(svgNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  _updateCursors() {
    [
      [this.hourGroup, 'hour'],
      [this.minuteGroup, 'minute'],
      [this.secondGroup, 'second'],
    ].forEach(([g, key]) => {
      g.style.cursor = this.interactive[key] ? 'grab' : 'default';
      g.style.pointerEvents = this.interactive[key] ? 'auto' : 'none';
    });
  }

  // ---------- 渲染 ----------
  render() {
    const { hour, minute, second } = this.time;
    const hourAngle = ((hour % 12) + minute / 60 + second / 3600) * 30;
    const minuteAngle = (minute + second / 60) * 6;
    const secondAngle = second * 6;

    this.hourGroup.setAttribute('transform', `rotate(${hourAngle} ${CENTER} ${CENTER})`);
    this.minuteGroup.setAttribute('transform', `rotate(${minuteAngle} ${CENTER} ${CENTER})`);
    this.secondGroup.setAttribute('transform', `rotate(${secondAngle} ${CENTER} ${CENTER})`);
  }

  // ---------- 交互：拖拽 ----------
  _bindEvents() {
    this._onPointerDown = (e) => {
      const handEl = e.target.closest('.hand');
      if (!handEl) return;
      const type = handEl.dataset.hand;
      if (!this.interactive[type]) return;
      this.dragging = type;
      handEl.style.cursor = 'grabbing';
      this.svg.setPointerCapture?.(e.pointerId);
      e.preventDefault();
      this._applyDrag(e);
    };
    this._onPointerMove = (e) => {
      if (!this.dragging) return;
      e.preventDefault();
      this._applyDrag(e);
    };
    this._onPointerUp = () => {
      if (!this.dragging) return;
      const g = { hour: this.hourGroup, minute: this.minuteGroup, second: this.secondGroup }[this.dragging];
      if (g) g.style.cursor = 'grab';
      this.dragging = null;
    };

    this.svg.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove, { passive: false });
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerUp);
  }

  _angleFromEvent(e) {
    const rect = this.svg.getBoundingClientRect();
    const scaleX = 300 / rect.width;
    const scaleY = 300 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const dx = x - CENTER;
    const dy = y - CENTER;
    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
  }

  _applyDrag(e) {
    const angle = this._angleFromEvent(e);
    const prev = { ...this.time };

    if (this.dragging === 'second') {
      const newSecond = Math.round(angle / 6) % 60;
      const diff = newSecond - prev.second;
      // 处理跨越 60/0 的进位到「分」
      let minute = prev.minute;
      let hour = prev.hour;
      if (diff < -30) {
        minute += 1;
      } else if (diff > 30) {
        minute -= 1;
      }
      if (minute >= 60) { minute -= 60; hour = (hour % 12) + 1; }
      if (minute < 0) { minute += 60; hour = ((hour - 2 + 12) % 12) + 1; }
      this.time = { hour, minute, second: newSecond };
    } else if (this.dragging === 'minute') {
      // 吸附到 5 分钟刻度（表盘上每个数字之间），符合儿童认表教学习惯
      const newMinute = (Math.round(angle / 30) * 5) % 60;
      const diff = newMinute - prev.minute;
      let hour = prev.hour;
      if (diff < -30) {
        hour = (hour % 12) + 1; // 分针从59走向0，进一小时
      } else if (diff > 30) {
        hour = ((hour - 2 + 12) % 12) + 1; // 分针从0倒退到59，退一小时
      }
      this.time = { hour, minute: newMinute, second: prev.second };
    } else if (this.dragging === 'hour') {
      // 时针独立拖动时，按最近的整点吸附，分/秒保持不变，
      // 便于孩子明确「时针指向哪个数字」。
      const contHour = angle / 30;
      let newHour = Math.round(contHour) % 12;
      if (newHour === 0) newHour = 12;
      this.time = { hour: newHour, minute: prev.minute, second: prev.second };
    }

    this.render();
    this.onChange(this.getTime(), this.dragging);
  }
}
