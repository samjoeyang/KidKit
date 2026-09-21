import { FINGER_COLORS, FINGER_MAP } from '../data/fingers'

type KeyboardProps = {
  nextLetter: string | null
  onPress: (letter: string) => void
}

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

/**
 * 完整 3 行 QWERTY 键盘：
 * - 下一个要按的字母黄色高亮（hint）
 * - 其余键按标准指法淡色染色（提示该用哪个手指敲）
 */
export default function Keyboard({ nextLetter, onPress }: KeyboardProps) {
  return (
    <div className="keyboard" role="group" aria-label="虚拟键盘，要按的键已高亮">
      {ROWS.map((row, ri) => (
        <div key={ri} className="krow">
          {row.split('').map((letter) => {
            const isHint = letter === nextLetter
            const fingerKey = FINGER_MAP[letter]
            const tint = fingerKey && !isHint ? FINGER_COLORS[fingerKey.split('-')[1] as keyof typeof FINGER_COLORS] + '33' : undefined
            return (
              <button
                key={letter}
                type="button"
                className={`key${isHint ? ' hint' : ''}`}
                style={tint ? { background: tint } : undefined}
                aria-label={`按键 ${letter}`}
                aria-current={isHint ? 'true' : undefined}
                onClick={() => onPress(letter)}
              >
                {letter}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
