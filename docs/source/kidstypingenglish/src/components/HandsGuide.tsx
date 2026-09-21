import {
  FINGER_COLORS,
  FINGER_MAP,
  FINGER_NAMES_ZH,
  HAND_NAMES_ZH,
  type FingerName,
} from '../data/fingers'

type HandsGuideProps = {
  nextLetter: string | null
}

type HandSide = 'L' | 'R'

/* 手指俯视图布局：左手小指在左，右手小指在右（镜像） */
const FINGER_ORDER: Record<HandSide, FingerName[]> = {
  L: ['pinky', 'ring', 'middle', 'index'],
  R: ['index', 'middle', 'ring', 'pinky'],
}

const FINGER_GEO = [
  { x: 22, y: 22, w: 22, h: 72, r: 11 },
  { x: 50, y: 6, w: 22, h: 92, r: 11 },
  { x: 78, y: 0, w: 22, h: 102, r: 11 },
  { x: 106, y: 16, w: 22, h: 82, r: 11 },
]

function HandSVG({ side, activeFinger }: { side: HandSide; activeFinger: string | null }) {
  const thumbTransform = side === 'L' ? 'rotate(35 128 118)' : 'rotate(-35 32 118)'
  const thumbX = side === 'L' ? 118 : 4
  return (
    <svg viewBox="0 0 150 165" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="18" y="88" width="114" height="66" rx="28" fill="#F0ECFB" />
      {FINGER_ORDER[side].map((finger, i) => {
        const g = FINGER_GEO[i]
        const isActive = activeFinger === `${side}-${finger}`
        return (
          <rect
            key={finger}
            className={`finger${isActive ? ' active' : ''}`}
            data-finger={finger}
            x={g.x}
            y={g.y}
            width={g.w}
            height={g.h}
            rx={g.r}
            fill={isActive ? FINGER_COLORS[finger] : FINGER_COLORS[finger] + '55'}
          />
        )
      })}
      <rect
        x={thumbX}
        y="106"
        width="52"
        height="24"
        rx="12"
        fill="#F0ECFB"
        transform={thumbTransform}
      />
    </svg>
  )
}

/** 双手指法提示：根据下一个要按的字母，高亮对应手指、手掌卡片与文字提示 */
export default function HandsGuide({ nextLetter }: HandsGuideProps) {
  const mapping = nextLetter ? FINGER_MAP[nextLetter.toLowerCase()] : null
  const side = mapping?.charAt(0) as HandSide | undefined
  const finger = mapping?.split('-')[1] as FingerName | undefined
  const label =
    mapping && side && finger
      ? `用${HAND_NAMES_ZH[side]}${FINGER_NAMES_ZH[finger]}敲 "${nextLetter!.toUpperCase()}"`
      : ' '

  return (
    <>
      <div className="finger-label" aria-live="polite">
        {label}
      </div>
      <div className="hands">
        <div className={`hand-card${side === 'L' ? ' active-hand' : ''}`}>
          <HandSVG side="L" activeFinger={mapping} />
          <div className="hand-label">左手 Left</div>
        </div>
        <div className={`hand-card${side === 'R' ? ' active-hand' : ''}`}>
          <HandSVG side="R" activeFinger={mapping} />
          <div className="hand-label">右手 Right</div>
        </div>
      </div>
      <div className="finger-legend">
        <span>
          <i style={{ background: '#FF6F9C' }} aria-hidden="true" />
          小指
        </span>
        <span>
          <i style={{ background: '#FFD35C' }} aria-hidden="true" />
          无名指
        </span>
        <span>
          <i style={{ background: '#58C97B' }} aria-hidden="true" />
          中指
        </span>
        <span>
          <i style={{ background: '#6FC3FF' }} aria-hidden="true" />
          食指
        </span>
      </div>
    </>
  )
}
