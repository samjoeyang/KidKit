import { useEffect, useRef, useState } from 'react'

/* ---------------- 使用限制：每天3次，每次15分钟 ---------------- */

const SESSION_MS = 15 * 60 * 1000 // 单次最长 15 分钟
const MAX_SESSIONS = 3
const STORAGE_KEY = 'kids_typing_usage'
const UNLOCK_HOLD_MS = 3000 // 家长解锁需长按 3 秒

type UsageState = { date: string; sessionsUsed: number; remainingMs: number }

type Props = {
  /** 会话是否处于计时状态：已点"开始"且未点"暂停" */
  active: boolean
  /** 点击底部右侧"暂停"按钮 */
  onPause: () => void
  /** 家长解锁开启新时段（App 需重置 started/paused，重新显示"开始"门） */
  onNewSession: () => void
}

function todayStr() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function loadState(): UsageState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as UsageState
      if (s && typeof s.date === 'string' && typeof s.sessionsUsed === 'number' && typeof s.remainingMs === 'number') {
        return s.date !== todayStr() ? { date: todayStr(), sessionsUsed: 0, remainingMs: SESSION_MS } : s
      }
    }
  } catch {
    /* ignore */
  }
  return { date: todayStr(), sessionsUsed: 0, remainingMs: SESSION_MS }
}

function saveState(s: UsageState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

function fmt(ms: number) {
  const sec = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

export default function ScreenTimeLimit({ active, onPause, onNewSession }: Props) {
  const [state, setState] = useState<UsageState>(loadState)
  const ref = useRef(state)
  const holdRef = useRef<number | undefined>(undefined)

  // 状态变化即持久化（每次滴答 / 解锁 / 跨天重置）
  useEffect(() => {
    saveState(ref.current)
  }, [state])

  const available = state.remainingMs > 0 && state.sessionsUsed < MAX_SESSIONS
  const running = active && available

  // 计时：仅会话进行中且页面可见时累加
  useEffect(() => {
    if (!running) return
    let last = Date.now()
    const id = window.setInterval(() => {
      const today = todayStr()
      if (today !== ref.current.date) {
        // 跨天重置
        ref.current = { date: today, sessionsUsed: 0, remainingMs: SESSION_MS }
        setState(ref.current)
        return
      }
      if (document.visibilityState !== 'visible') {
        last = Date.now() // 切走/最小化：暂停，回来时从当前时刻重新计时
        return
      }
      const now = Date.now()
      const delta = now - last
      last = now
      const r = Math.max(0, ref.current.remainingMs - delta)
      ref.current = { ...ref.current, remainingMs: r }
      if (r <= 0) ref.current = { ...ref.current, sessionsUsed: ref.current.sessionsUsed + 1 } // 本时段用完，记一次
      setState(ref.current)
    }, 1000)
    const onVis = () => {
      last = Date.now()
    }
    document.addEventListener('visibilitychange', onVis)
    const onHide = () => saveState(ref.current)
    window.addEventListener('pagehide', onHide)
    window.addEventListener('beforeunload', onHide)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', onHide)
      window.removeEventListener('beforeunload', onHide)
    }
  }, [running])

  /* ---------------- 家长解锁（长按3秒开启下一次） ---------------- */
  const startHold = () => {
    if (ref.current.sessionsUsed >= MAX_SESSIONS) return
    window.clearTimeout(holdRef.current)
    holdRef.current = window.setTimeout(() => {
      ref.current = { ...ref.current, remainingMs: SESSION_MS }
      setState(ref.current)
      onNewSession()
    }, UNLOCK_HOLD_MS)
  }
  const cancelHold = () => {
    window.clearTimeout(holdRef.current)
    holdRef.current = undefined
  }

  const remaining = Math.max(0, state.remainingMs)
  const remainUses = Math.max(0, MAX_SESSIONS - state.sessionsUsed)
  const allUsed = state.sessionsUsed >= MAX_SESSIONS

  return (
    <>
      <div className="screen-time-bar">
        <span className="screen-time-pill">
          ⏱ {fmt(remaining)} · 今日剩余 {remainUses} 次
        </span>
        {active && (
          <button type="button" className="screen-time-pause" onClick={onPause}>
            ⏸ 暂停
          </button>
        )}
      </div>
      {!available && (
        <div className="screen-time-overlay">
          {allUsed ? (
            <p>今日使用次数已用完，明天再来吧！</p>
          ) : (
            <>
              <p>本时段（15分钟）已用完</p>
              <p className="screen-time-sub">今日还可使用 {remainUses} 次</p>
              <button
                type="button"
                className="parent-unlock-btn"
                onPointerDown={startHold}
                onPointerUp={cancelHold}
                onPointerLeave={cancelHold}
                onPointerCancel={cancelHold}
                onContextMenu={(e) => e.preventDefault()}
              >
                家长解锁（长按 3 秒）
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
