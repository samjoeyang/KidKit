import { useRef, useState, type ChangeEvent } from 'react'
import { parseFileContent, parseLines, type WordItem } from '../data/words'

type LibraryModalProps = {
  open: boolean
  words: WordItem[]
  onClose: () => void
  onAdd: (words: WordItem[]) => void
  onExport: () => void
  onClear: () => void
  onDelete: (index: number) => void
}

/** 词库管理弹窗：粘贴 / 上传 / 导出 / 清空 / 删除单个单词 */
export default function LibraryModal({
  open,
  words,
  onClose,
  onAdd,
  onExport,
  onClear,
  onDelete,
}: LibraryModalProps) {
  const [text, setText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const handleAdd = () => {
    onAdd(parseLines(text))
    setText('')
  }

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onAdd(parseFileContent(String(ev.target?.result ?? '')))
    }
    reader.onerror = () => alert('文件读取失败，请重试。')
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lib-title"
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="关闭词库管理">
          ✕
        </button>
        <h2 id="lib-title">📚 我的词库</h2>
        <p className="modal-hint">
          每行一个单词，格式：<code>english,中文,emoji</code>（中文和 emoji 可省略）。
          <br />
          也支持上传 <code>.csv</code> / <code>.txt</code> 文件（同样格式），或 <code>.json</code>{' '}
          文件（数组，每项包含 en / zh / emoji 字段）。
        </p>
        <textarea
          className="paste-area"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'cat,猫,🐱\ndog,狗\nelephant'}
        />
        <div className="modal-row">
          <label className="file-btn">
            📁 上传文件
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,.json"
              hidden
              onChange={handleFile}
            />
          </label>
          <button type="button" className="btn-primary" onClick={handleAdd}>
            ➕ 添加到词库
          </button>
        </div>
        <div className="modal-row">
          <button type="button" className="btn-secondary" onClick={onExport}>
            ⬇️ 导出词库
          </button>
          <button type="button" className="btn-danger" onClick={onClear}>
            🗑️ 清空词库
          </button>
        </div>
        <h3>
          当前词库（<span className="custom-count">{words.length}</span> 个单词）
        </h3>
        <div className="word-list">
          {words.length === 0 ? (
            <p className="empty-hint">还没有单词，快上传或粘贴添加吧！</p>
          ) : (
            words.map((w, i) => (
              <div key={i} className="word-row">
                <span className="w-emoji" aria-hidden="true">
                  {w.emoji || '📝'}
                </span>
                <span className="w-en">{w.en}</span>
                <span className="w-zh">{w.zh || ''}</span>
                <button
                  type="button"
                  className="w-del"
                  onClick={() => onDelete(i)}
                  aria-label={`删除单词 ${w.en}`}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
