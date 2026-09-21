type ProgressDotsProps = {
  count: number
  current: number
}

/** 本组单词进度点：已完成=绿色，当前=放大黄色 */
export default function ProgressDots({ count, current }: ProgressDotsProps) {
  return (
    <div
      className="progress"
      role="img"
      aria-label={`第 ${current + 1} 个，共 ${count} 个单词`}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`dot${i < current ? ' done' : ''}${i === current ? ' current' : ''}`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
