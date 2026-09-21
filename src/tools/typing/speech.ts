/* ============================================================================
   英文单词朗读

   踩过的坑（都会表现为「点了 🔊 没声音、控制台也不报错」）：

   1) 只设 lang='en-US'、不指定 voice。如果设备上没有匹配的英文语音，或者语音列表
      还没异步加载完（首次 getVoices() 经常返回空数组），浏览器静默失败。
   2) 在没在播放的时候也调 cancel()。macOS 版 Chrome 上多余的 cancel() 会把语音
      队列卡死，之后整页都不再出声。
   3) Chrome 的 cancel() 是异步的，紧接着同一个 tick 调 speak()，新排队的语音会被
      cancel 顺手清掉。
   4) 把 speak() 推进 setTimeout 会丢掉用户手势，Safari 要求朗读必须发生在手势里，
      所以首句必须同步调用。

   因此这里的策略是：只在真的正在播时才 cancel()，speak() 同步调用保住用户手势，
   朗读没起来时再补一次，并把 utterance 的 error 事件打印出来，避免再次「静默失败」。
   ========================================================================== */

function synth(): SpeechSynthesis | undefined {
  return typeof window !== 'undefined' ? window.speechSynthesis : undefined;
}

/**
 * 语音列表是异步加载的，提前触发一次 getVoices() 并监听 voiceschanged，
 * 避免第一次点 🔊 时列表还是空的。
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

/**
 * 在英文语音里挑一个最稳的：系统默认的英文语音 → 本地 en-US → 任意 en-US → 任意英文。
 * 注意只在英文语音里挑，避免用中文语音去念英文。
 */
function pickVoice(): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;

  const lang = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase();
  const english = s.getVoices().filter((v) => lang(v).startsWith('en'));
  if (!english.length) return null;

  return (
    english.find((v) => v.default) ??
    english.find((v) => lang(v) === 'en-us' && v.localService) ??
    english.find((v) => lang(v) === 'en-us') ??
    english[0]
  );
}

// 持有当前 utterance 的引用，避免它被垃圾回收后再也不出声
let current: SpeechSynthesisUtterance | null = null;
// 同一句话的重复触发（React StrictMode 在开发模式下会把 effect 跑两次）直接忽略
let lastText = '';
let lastAt = 0;

/** 朗读一段英文；设备不支持或无可用语音时静默返回 */
export function speakEnglish(text: string, rate = 0.85): void {
  const s = synth();
  if (!s) return;

  const now = Date.now();
  if (text === lastText && now - lastAt < 200) return;
  lastText = text;
  lastAt = now;

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  const voice = pickVoice();
  if (voice) u.voice = voice;
  current = u;

  let started = false;
  u.addEventListener?.('start', () => {
    started = true;
  });
  // 把真正的失败原因打出来，别再静默失败；interrupted/canceled 是主动打断，不算错
  u.addEventListener?.('error', (event) => {
    const err = (event as SpeechSynthesisErrorEvent).error;
    if (err !== 'interrupted' && err !== 'canceled') {
      console.warn(
        '[speech] 朗读失败：%s（语音=%s，可用语音 %d 个）',
        err,
        voice ? voice.name : '未指定',
        s.getVoices().length
      );
    }
  });

  // 只有真的在播时才 cancel，避免 macOS Chrome 上把语音队列卡死
  if (s.speaking || s.pending) s.cancel();
  s.resume(); // Chrome 有时会卡在 paused 状态，先恢复再播
  s.speak(u); // 同步调用：Safari 要求朗读发生在用户手势里

  // 兜底：Chrome 的 cancel() 异步生效，偶发会吞掉刚排队的语音，没起来就补一次
  window.setTimeout(() => {
    if (current !== u || started) return;
    if (!s.speaking && !s.pending) s.speak(u);
  }, 250);
}
