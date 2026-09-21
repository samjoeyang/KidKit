/* ============================================================================
   英文单词朗读

   ── 与原版（docs/source/kidstypingenglish/）一致的关键点 ──
   默认不指定 u.voice，只给 lang='en-US'，让系统挑默认英文语音。macOS 的
   getVoices() 会列出一堆并未真正下载的 Enhanced/Premium 语音，把 u.voice
   指到这种语音上会静默失败。

   ── 「没有声音、也没有报错」的几种成因，这里逐一处理 ──

   1) 队列卡在暂停状态（Chrome 最典型）。
      speak() 被接受了、不报 error，但 start 永远不来 —— 彻底没声音。
      关键：resume() 要放在 speak() **之后**再补一次，并且隔一会儿再补。

   2) 缺少用户手势。
      浏览器派发 error 事件（error === 'not-allowed'）而不是抛异常，
      不监听 error 就完全看不见。调用方不要在点「开始」之前朗读。

   3) 默认语音本身不可用。
      macOS 上「默认 en-US 语音」可能指向没下载的语音，这时换成明确选出的
      「本地英文语音」再试一次往往就能出声。

   4) 语音列表异步加载（首次 getVoices() 常返回空数组），进页面先预热。

   另外：只有在真的正在播放时才 cancel()（多余的 cancel 会把 macOS Chrome
   的语音队列卡死）；同一句话短时间内重复触发直接忽略（React StrictMode 会
   把 effect 跑两次）。
   ========================================================================== */

function synth(): SpeechSynthesis | undefined {
  return typeof window !== 'undefined' ? window.speechSynthesis : undefined;
}

/**
 * 语音列表是异步加载的，提前触发一次 getVoices() 并监听 voiceschanged。
 * @returns 取消监听的函数
 */
export function primeVoices(): () => void {
  const s = synth();
  if (!s) return () => {};

  const warm = () => s.getVoices();
  warm();
  s.addEventListener?.('voiceschanged', warm);
  return () => s.removeEventListener?.('voiceschanged', warm);
}

/** 当前合成器状态，用于诊断「为什么没出声」 */
function state() {
  const s = synth();
  if (!s) return { speaking: false, pending: false, paused: false, total: 0, english: 0 };
  const all = s.getVoices();
  return {
    speaking: s.speaking,
    pending: s.pending,
    paused: s.paused,
    total: all.length,
    english: all.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('en')).length,
  };
}

/** 明确挑一个「本地的英文语音」，用于默认语音不出声时的兜底重试 */
function pickLocalEnglishVoice(): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;
  const lang = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase();
  const en = s.getVoices().filter((v) => lang(v).startsWith('en'));
  return (
    en.find((v) => v.localService && lang(v) === 'en-us') ?? en.find((v) => v.localService) ?? null
  );
}

/** 把浏览器的失败原因翻译成人能看懂、能照做的话 */
function describe(err: string): string {
  switch (err) {
    case 'not-allowed':
      return '浏览器要求先有用户手势才允许朗读（请先点一下页面，不要在页面刚打开时自动朗读）';
    case 'synthesis-failed':
      return '合成失败，通常是系统里没有可用的英文语音';
    case 'audio-busy':
    case 'audio-hardware':
      return '音频设备被占用或不可用';
    case 'language-unavailable':
    case 'voice-unavailable':
      return '找不到英语语音，请在系统设置里安装英语语音';
    default:
      return '';
  }
}

// 朗读期间持有 utterance 的引用，避免它被垃圾回收后再也不出声
let current: SpeechSynthesisUtterance | null = null;
// 每次朗读的编号：新一轮朗读会让上一轮的重试链失效
let token = 0;
// 同一句话的重复触发直接忽略，避免 cancel/speak 连着来两遍
let lastText = '';
let lastAt = 0;

/** 朗读一段英文；设备不支持时静默返回 */
export function speakEnglish(text: string, rate = 0.85): void {
  const s = synth();
  if (!s) return;

  const now = Date.now();
  if (text === lastText && now - lastAt < 200) return;
  lastText = text;
  lastAt = now;

  const my = ++token;
  let started = false;

  /** 造一个 utterance；voice 为 null 时交给系统挑默认英文语音 */
  const build = (voice: SpeechSynthesisVoice | null) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    if (voice) u.voice = voice;
    u.addEventListener?.('start', () => {
      started = true;
    });
    u.addEventListener?.('error', (event) => {
      const err = (event as SpeechSynthesisErrorEvent).error;
      if (err === 'interrupted' || err === 'canceled') return; // 主动打断，不算故障
      const hint = describe(err);
      console.warn(`[speech] 朗读失败：${err}${hint ? ' —— ' + hint : ''}`, state());
    });
    // 读完就释放引用，只有朗读期间才需要一直持有
    u.addEventListener?.('end', () => {
      if (current === u) current = null;
    });
    return u;
  };

  const fire = (voice: SpeechSynthesisVoice | null) => {
    const u = build(voice);
    current = u;
    s.speak(u);
    // 关键：resume() 要放在 speak() 之后再补一次。
    // Chrome 经常卡在 paused，此时 speak() 不报错、start 也永远不来。
    s.resume();
  };

  // 只有真的在播（或还有排队）时才 cancel，避免多余 cancel 把队列卡死
  if (s.speaking || s.pending) s.cancel();
  fire(null); // 与原版一致：不指定 voice，让系统挑默认英文语音

  const alive = () => my === token && !started;

  // 250ms 还没开始：再解一次暂停
  window.setTimeout(() => {
    if (alive()) s.resume();
  }, 250);

  // 700ms 还没开始：
  //   队列里还有东西 → 卡住了，继续解暂停；
  //   队列是空的     → 这句被丢掉了，按原版方式重排一次。
  window.setTimeout(() => {
    if (!alive()) return;
    if (s.speaking || s.pending) s.resume();
    else fire(null);
  }, 700);

  // 1100ms 还没开始且队列是空的：换成明确的「本地英文语音」再试一次
  window.setTimeout(() => {
    if (!alive()) return;
    if (s.speaking || s.pending) s.resume();
    else {
      const voice = pickLocalEnglishVoice();
      if (voice) fire(voice);
    }
  }, 1100);

  // 1.6s 还没开始：把完整状态打出来，别再让人对着「没声音也没报错」发呆
  window.setTimeout(() => {
    if (!alive()) return;
    const st = state();
    const why =
      st.english === 0
        ? '系统里没有可用的英文语音，请在「系统设置 → 辅助功能 → 朗读内容 → 系统声音」里安装英语语音。'
        : st.paused
          ? '语音队列卡在暂停状态（Chrome 的老问题），已多次 resume() 仍未恢复，可以刷新页面或换浏览器再试。'
          : '语音存在但没能合成，说明问题在浏览器/系统的语音服务，而不是这段代码；'
              + '可以换 Safari 或 Chrome 对比一下，确认是不是该浏览器的语音服务被系统禁用了。';
    console.warn(
      `[speech] 🔊 没有开始发声（可用语音 ${st.total} 个，英文 ${st.english} 个；` +
        `speaking=${st.speaking} pending=${st.pending} paused=${st.paused}）。${why}`
    );
  }, 1600);
}
