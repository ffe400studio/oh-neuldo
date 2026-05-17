import { useState, useRef } from 'react'
import { ChevronLeft, Plus } from 'lucide-react'
import { genId } from '../../constants'

export default function TopicDetail({ goBack, topicId, topics, setTopics }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const topic = topics.find(t => t.id === topicId)
  if (!topic) return (
    <div style={{ padding: 20 }}>
      <button onClick={goBack}>뒤로</button>
      <p>대주제를 찾을 수 없어요.</p>
    </div>
  )

  const addSubtask = () => {
    if (!input.trim()) return
    setTopics(prev => prev.map(t =>
      t.id === topicId
        ? { ...t, subtasks: [...t.subtasks, { id: genId(), title: input.trim(), isDone: false }] }
        : t
    ))
    setInput('')
    inputRef.current?.focus()
  }

  const toggleSubtask = (sid) => {
    setTopics(prev => prev.map(t =>
      t.id === topicId
        ? { ...t, subtasks: t.subtasks.map(s => s.id === sid ? { ...s, isDone: !s.isDone } : s) }
        : t
    ))
  }

  const longTimers = useRef({})

  const startLongPress = (sid) => {
    longTimers.current[sid] = setTimeout(() => {
      if (window.confirm('이 소주제를 삭제할까요?')) {
        setTopics(prev => prev.map(t =>
          t.id === topicId
            ? { ...t, subtasks: t.subtasks.filter(s => s.id !== sid) }
            : t
        ))
      }
    }, 600)
  }
  const cancelLongPress = (sid) => clearTimeout(longTimers.current[sid])

  const done = topic.subtasks.filter(s => s.isDone).length
  const pct = topic.subtasks.length ? (done / topic.subtasks.length) * 100 : 0

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F2F3' }}>
      {/* 헤더 */}
      <div style={{ padding: '16px 20px', backgroundColor: '#F5F2F3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronLeft size={24} color="#111" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: topic.color }} />
            <span style={{ fontWeight: 700, fontSize: 18 }}>{topic.title}</span>
          </div>
        </div>
        <div style={{ paddingLeft: 44, fontSize: 12, color: '#aaa' }}>
          {topic.startDate} ~ {topic.endDate}
        </div>
        {topic.subtasks.length > 0 && (
          <div style={{ paddingLeft: 44, marginTop: 10 }}>
            <div style={{ height: 4, backgroundColor: '#ddd', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: topic.color, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 12, color: '#aaa', marginTop: 4, display: 'block' }}>{done} / {topic.subtasks.length}</span>
          </div>
        )}
      </div>

      {/* 소주제 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
        {topic.subtasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa', fontSize: 15 }}>
            아직 등록된 내용이 없어요 ✦
          </div>
        ) : (
          topic.subtasks.map(s => (
            <label
              key={s.id}
              onMouseDown={() => startLongPress(s.id)}
              onMouseUp={() => cancelLongPress(s.id)}
              onMouseLeave={() => cancelLongPress(s.id)}
              onTouchStart={() => startLongPress(s.id)}
              onTouchEnd={() => cancelLongPress(s.id)}
              onTouchCancel={() => cancelLongPress(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 4px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={s.isDone}
                onChange={() => toggleSubtask(s.id)}
                style={{ accentColor: '#111', width: 20, height: 20, cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{
                flex: 1,
                fontSize: 15,
                color: s.isDone ? '#aaa' : '#111',
                textDecoration: s.isDone ? 'line-through' : 'none',
                transition: 'all 0.2s',
              }}>
                {s.title}
              </span>
            </label>
          ))
        )}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#ccc', marginTop: 16 }}>길게 누르면 삭제돼요</p>
      </div>

      {/* 입력창 */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: 10,
        backgroundColor: '#fff',
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addSubtask()}
          placeholder="소주제 추가..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 15,
            backgroundColor: 'transparent',
            color: '#111',
          }}
        />
        <button
          onClick={addSubtask}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#111',
            fontWeight: 700,
            fontSize: 14,
            padding: '0 4px',
          }}
        >
          추가
        </button>
      </div>
    </div>
  )
}
