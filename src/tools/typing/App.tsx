import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildCategories,
  loadCustomWords,
  saveCustomWords,
  sortByLength,
  type WordItem,
} from './data/words'
import CategoryTabs from './components/CategoryTabs'
import ProgressDots from './components/ProgressDots'
import WordTrain from './components/WordTrain'
import HandsGuide from './components/HandsGuide'
import Keyboard from './components/Keyboard'
import LibraryModal from './components/LibraryModal'
import ScreenTimeLimit from './components/ScreenTimeLimit'
import { primeVoices, speakEnglish } from './speech'

const PRAISES = ['太棒了！', '真厉害！', '继续加油！', '你真聪明！', '完美！', '做得好！']
const MASCOTS = ['🦊', '🐼', '🐧', '🐨']

export default function App() {
  const [cat, setCat] = useState('animals')
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [stars, setStars] = useState(0)
  const [customWords, setCustomWords] = useState<WordItem[]>(() => loadCustomWords())
  const [modalOpen, setModalOpen] = useState(false)
  const [mascot, setMascot] = useState('🦊')
  const [bubble, setBubble] = useState('你好呀！点击🔊听单词，然后打出它吧！')
  const [zhLabel, setZhLabel] = useState(' ')
  const [feedback, setFeedback] = useState(' ')
  const [shakeIdx, setShakeIdx] = useState<number | null>(null)
  const [started, setStarted] = useState(false) // 是否已点击"开始"
  const [paused, setPaused] = useState(false) // 是否已暂停

  const sessionActive = started && !paused

  const modalOpenRef = useRef(modalOpen)
  useEffect(() => {
    modalOpenRef.current = modalOpen
  }, [modalOpen])

  // 会话进行中才允许键盘输入（开始前 / 暂停中忽略）
  const activeRef = useRef(false)
  useEffect(() => {
    activeRef.current = sessionActive
  }, [sessionActive])

  const categories = useMemo(() => buildCategories(customWords), [customWords])
  const words = categories[cat].words
  const word = words.length ? words[index % words.length] : null
  const nextLetter = word ? word.en[typed.length] ?? null : null

  /* ---------------- 语音朗读 ---------------- */
  // 具体实现见 ./speech.ts（语音选择 / Chrome cancel 竞态 / paused 处理）
  const speak = speakEnglish

  // 语音列表异步加载，进页面先预热，避免第一次点 🔊 时还没有可用语音
  useEffect(() => primeVoices(), [])

  // 载入单词时：自动朗读 + 重置展示 + 换吉祥物（换词 / 换分类）
  // 注意：点「开始」之前不朗读 —— 页面刚打开时没有用户手势，
  // 浏览器会以 not-allowed 拒绝朗读（这正是「没声音也没报错」的原因之一）。
  useEffect(() => {
    if (!word) return
    setMascot(MASCOTS[Math.floor(Math.random() * MASCOTS.length)])
    setZhLabel(' ')
    setFeedback(' ')
    if (started) speak(word.en)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.en, started])

  /* ---------------- 彩带庆祝 ---------------- */
  function burstConfetti() {
    const emojis = ['⭐', '🎉', '✨', '🌟']
    for (let i = 0; i < 14; i++) {
      const c = document.createElement('div')
      c.className = 'confetti'
      c.textContent = emojis[Math.floor(Math.random() * emojis.length)]
      c.style.left = Math.random() * 100 + 'vw'
      c.style.animationDuration = 1.4 + Math.random() * 1.2 + 's'
      document.body.appendChild(c)
      setTimeout(() => c.remove(), 3000)
    }
  }

  /* ---------------- 完成一个单词 ---------------- */
  const completeWord = useCallback(() => {
    if (!word) return
    setStars((s) => s + 1)
    setZhLabel(word.zh || '')
    setFeedback(PRAISES[Math.floor(Math.random() * PRAISES.length)] + ' ' + word.en.toUpperCase())
    setBubble(PRAISES[Math.floor(Math.random() * PRAISES.length)])
    speak('Great job! ' + word.en, 0.9)
    burstConfetti()
    const len = words.length
    setTimeout(() => {
      setIndex((i) => (i + 1) % len)
      setTyped('')
    }, 1400)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.en, words.length])

  /* ---------------- 处理输入 ---------------- */
  const handleLetter = useCallback(
    (letter: string) => {
      if (!word) return
      const expected = word.en[typed.length]
      if (!expected) return

      if (letter.toLowerCase() === expected.toLowerCase()) {
        const newTyped = typed + expected
        setTyped(newTyped)
        if (newTyped.length === word.en.length) completeWord()
      } else {
        setShakeIdx(typed.length)
        setTimeout(() => setShakeIdx(null), 300)
      }
    },
    [word, typed, completeWord],
  )

  // 物理键盘监听（弹窗打开时忽略）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modalOpenRef.current || !activeRef.current) return
      if (/^[a-zA-Z]$/.test(e.key)) handleLetter(e.key)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleLetter])

  // 空格键：朗读当前单词一次
  useEffect(() => {
    const onSpace = (e: KeyboardEvent) => {
      if (modalOpenRef.current || !activeRef.current) return
      if (e.code !== 'Space') return
      if (e.repeat) return // 按住不放只响一次
      e.preventDefault()
      if (word) speak(word.en)
    }
    window.addEventListener('keydown', onSpace)
    return () => window.removeEventListener('keydown', onSpace)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word])

  // Esc 关闭弹窗
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [])

  /* ---------------- 分类切换 ---------------- */
  const selectCategory = useCallback((key: string) => {
    setCat(key)
    setIndex(0)
    setTyped('')
    setShakeIdx(null)
  }, [])

  /* ---------------- 词库操作 ---------------- */
  const addWordsToCustom = useCallback(
    (newWords: WordItem[]) => {
      if (!newWords.length) {
        alert('没有识别到有效的单词，请检查格式，例如：cat,猫,🐱')
        return
      }
      const seen = new Set(customWords.map((w) => w.en))
      const merged = [...customWords]
      let addedCount = 0
      newWords.forEach((w) => {
        if (w.en && !seen.has(w.en)) {
          merged.push(w)
          seen.add(w.en)
          addedCount++
        }
      })
      const sorted = sortByLength(merged)
      saveCustomWords(sorted)
      setCustomWords(sorted)
      if (cat === 'custom') {
        setIndex(0)
        setTyped('')
      }
      if (addedCount === 0) alert('这些单词已经在词库里了～')
    },
    [customWords, cat],
  )

  const deleteWord = useCallback(
    (i: number) => {
      setCustomWords((prev) => {
        const next = [...prev]
        next.splice(i, 1)
        saveCustomWords(next)
        return next
      })
      if (cat === 'custom') {
        setIndex(0)
        setTyped('')
      }
    },
    [cat],
  )

  const clearCustom = useCallback(() => {
    if (!customWords.length) return
    if (confirm('确定要清空自建词库吗？此操作无法撤销。')) {
      saveCustomWords([])
      setCustomWords([])
      if (cat === 'custom') {
        setIndex(0)
        setTyped('')
      }
    }
  }, [customWords, cat])

  const exportCustom = useCallback(() => {
    if (!customWords.length) {
      alert('词库还是空的，先添加一些单词吧！')
      return
    }
    const data = JSON.stringify(customWords, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-word-list.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [customWords])

  /* ---------------- 渲染 ---------------- */
  return (
    <div className="wrap">
      <header className="app-header">
        <h1 className="app-title">
          字母小火车 <span>Typing Train</span>
        </h1>
        <div className="stars">
          <span className="star-icon" aria-hidden="true">
            ⭐
          </span>
          <span className="star-count">{stars}</span>
        </div>
      </header>

      <main className="app-main">
        <CategoryTabs categories={categories} active={cat} onSelect={selectCategory} />

        <div className="lib-row">
          <button type="button" className="lib-btn" onClick={() => setModalOpen(true)}>
            📚 管理我的自建词库
          </button>
        </div>

        {words.length > 0 && <ProgressDots count={words.length} current={index % words.length} />}

        <div className="card">
          {!started ? (
            <div className="start-gate">
              <div className="gate-emoji" aria-hidden="true">
                🎮
              </div>
              <button type="button" className="start-btn" onClick={() => setStarted(true)}>
                开始
              </button>
              <p>点击开始，进入 15 分钟练习</p>
            </div>
          ) : (
            <>
          {words.length === 0 ? (
            <div className="empty-state">
              <div className="empty-big" aria-hidden="true">
                📭
              </div>
              <p>这个词库还是空的。上传单词表，或者手动添加几个单词，就能开始打字练习啦！</p>
              <button type="button" className="empty-add" onClick={() => setModalOpen(true)}>
                ➕ 添加单词
              </button>
            </div>
          ) : word ? (
            <>
              <div className="mascot-row">
                <div className="mascot" aria-hidden="true">
                  {mascot}
                </div>
                <div className="bubble">{bubble}</div>
              </div>

              <div className="emoji-big" aria-hidden="true">
                {word.emoji || '📝'}
              </div>
              <div className="zh-label" aria-hidden="true">
                {zhLabel}
              </div>

              <button
                type="button"
                className="listen-btn"
                onClick={() => speak(word.en)}
                aria-label="听单词发音"
                title="听发音"
              >
                🔊
              </button>

              <WordTrain word={word.en} typed={typed} shakeIdx={shakeIdx} />

              <div className="feedback" role="status">
                {feedback}
              </div>

              <HandsGuide nextLetter={nextLetter} />

              <Keyboard nextLetter={nextLetter} onPress={handleLetter} />
            </>
          ) : null}
          {paused && (
            <div className="pause-overlay">
              <button type="button" className="resume-btn" onClick={() => setPaused(false)}>
                继续
              </button>
            </div>
          )}
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        用真实键盘直接打字，或点击虚拟键盘 · 每完成一个单词获得一颗星星 ⭐
      </footer>

      <LibraryModal
        open={modalOpen}
        words={customWords}
        onClose={() => setModalOpen(false)}
        onAdd={addWordsToCustom}
        onExport={exportCustom}
        onClear={clearCustom}
        onDelete={deleteWord}
      />

      <ScreenTimeLimit
        active={sessionActive}
        onPause={() => setPaused(true)}
        onNewSession={() => {
          setStarted(false)
          setPaused(false)
        }}
      />
    </div>
  )
}
