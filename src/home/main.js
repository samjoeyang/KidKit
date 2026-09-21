import './home.css';

// KidKit 首页：四个小工具的索引页
const TOOLS = [
  {
    id: 'clock',
    emoji: '🕐',
    title: '认识时钟',
    subtitle: '糖果时间乐园',
    desc: '拖动时针分针，认识钟表上的时间；附带一年 12 个月的日历学习页。',
    tags: ['认表挑战', '自由拨表', '学日历'],
    color: '#ff6fa5',
    links: [
      { label: '🕐 认识时钟', href: 'tools/clock/' },
      { label: '🗓️ 学日历', href: 'tools/calendar/' },
    ],
  },
  {
    id: 'bishun',
    emoji: '✏️',
    title: '笔顺小屋',
    subtitle: '写好每一笔',
    desc: '输入任意一个汉字，立刻看到它有几笔、每一笔的先后顺序，还能玩笔顺大挑战。',
    tags: ['笔顺分解', '书写动画', '笔顺大挑战'],
    color: '#ff8a3d',
    links: [{ label: '✏️ 开始写笔顺', href: 'tools/bishun/' }],
  },
  {
    id: 'typing',
    emoji: '🚂',
    title: '字母小火车',
    subtitle: '打字学英语',
    desc: '用真实键盘或虚拟键盘敲出英文单词，有分类词库、发音朗读和指法提示。',
    tags: ['分类词库', '语音朗读', '指法提示'],
    color: '#3fa0e8',
    links: [{ label: '🚂 开始打字', href: 'tools/typing/' }],
  },
  {
    id: 'shidianguji',
    emoji: '📜',
    title: '识典古籍检索',
    subtitle: '以词索史',
    desc: '输入关键词，在识典古籍公开数据里检索书目与原文出处，一键跳转官网阅读。',
    tags: ['繁简检索', '原文出处', '相关典籍'],
    color: '#a03b2e',
    links: [{ label: '📜 开始检索', href: 'tools/shidianguji/' }],
  },
];

const app = document.getElementById('app');

app.innerHTML = `
  <div class="page">
    <header class="hero">
      <div class="hero-badge">🧰 KidKit</div>
      <h1>学习小工具合集</h1>
      <p class="hero-sub">好用的课堂、居家学习小工具，点一下就能用，不用安装。</p>
    </header>

    <main class="grid" id="toolGrid"></main>

    <footer class="footer">
      KidKit · 所有工具都在浏览器里运行，打开即用 · 共 ${TOOLS.length} 个小工具
    </footer>
  </div>
`;

const grid = document.getElementById('toolGrid');

grid.innerHTML = TOOLS.map((tool) => {
  const links = tool.links
    .map((l) => `<a class="open-btn" href="${l.href}" style="--c:${tool.color}">${l.label}</a>`)
    .join('');
  const tags = tool.tags.map((t) => `<span class="tag">${t}</span>`).join('');
  return `
    <article class="card" style="--c:${tool.color}">
      <div class="card-emoji" aria-hidden="true">${tool.emoji}</div>
      <h2 class="card-title">${tool.title}<small>${tool.subtitle}</small></h2>
      <p class="card-desc">${tool.desc}</p>
      <div class="tags">${tags}</div>
      <div class="links">${links}</div>
    </article>
  `;
}).join('');
