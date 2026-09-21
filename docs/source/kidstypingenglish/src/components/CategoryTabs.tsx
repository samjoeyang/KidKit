import type { CategoryWords } from '../data/words'

type CategoryTabsProps = {
  categories: Record<string, CategoryWords>
  active: string
  onSelect: (key: string) => void
}

/** 单词分类切换标签 */
export default function CategoryTabs({ categories, active, onSelect }: CategoryTabsProps) {
  return (
    <div className="cats" role="tablist" aria-label="单词分类">
      {Object.entries(categories).map(([key, cat]) => {
        const isActive = key === active
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`cat-btn${isActive ? ' active' : ''}`}
            style={isActive ? { background: cat.color } : undefined}
            onClick={() => onSelect(key)}
          >
            {cat.label}
            {key === 'custom' ? ` (${cat.words.length})` : ''}
          </button>
        )
      })}
    </div>
  )
}
