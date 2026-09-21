type WordTrainProps = {
  word: string
  typed: string
  shakeIdx: number | null
}

/**
 * 字母小火车：
 * - 每个字母一节车厢，字母始终可见（未输入为淡显）
 * - 已输入字母：绿色填充 + 白字
 * - 当前字母：黄色放大脉动 + 加深文字
 * - 按错：当前车厢抖动
 */
export default function WordTrain({ word, typed, shakeIdx }: WordTrainProps) {
  return (
    <div className="train" role="group" aria-label={`单词 ${word}，已输入 ${typed.length} 个字母`}>
      <div className="engine" aria-hidden="true">
        🚂
      </div>
      {Array.from(word).map((ch, i) => {
        const filled = i < typed.length
        const current = i === typed.length
        const cls = [
          'car',
          filled ? 'filled' : '',
          current ? 'current' : '',
          !filled && !current ? 'upcoming' : '',
          shakeIdx === i ? 'shake' : '',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <div key={i} className={cls} aria-label={current ? `下一个字母 ${ch}` : ch}>
            {ch}
          </div>
        )
      })}
    </div>
  )
}
