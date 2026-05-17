import { useState, useRef } from 'react'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { genId } from '../../constants'

export default function TopicDetail({
  goBack, topicId, topics, setTopics, saveTopic, deleteTopic,
  setPosts, setTodayPicks, todayPicks,
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const topic = topics.find(t => t.id === topicId)
  if (!topic) return (
    <div style={{ padding: 20 }}>
      <button onClick={goBack}>뒤로</button>
      <p>대주제를 찾을 수 없어요.</p>
    </div>
  )

  const updateTopic = async (updatedTopic) => {
    setTopics(prev => prev.map(t => t.id === topicId ? updatedTopic : t))
    await saveTopic(updatedTopic, false)
  }

  const handleDeleteTopic = async () => {
    if (!window.confirm(`"${topic.title}" 대주제를 삭제할까요?\n관련 게시글도 모두 삭제돼요.`)) return
    setTopics(prev => prev.filter(t => t.id !== topicId))
    setPosts(prev => prev.filter(p => p.topicId !== topicId))
    const subtaskIds = new Set(topic.subtasks.map(s => s.id))
    setTodayPicks(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(d => { next[d] = next[d].filter(id => !subtaskIds.has(id)) })
      return next
    })
    await deleteTopic(topicId)
    goBack()
  }

  const addSubtask = async () => {
    if (!input.trim()) return
    const updated = { ...topic, subtasks: [...topic.subtasks, { id: genId(), title: input.trim(), isDone: false }] }
    await updateTopic(updated)
    setInput('')
    inputRef.current?.focus()
  }

  const toggleSubtask = async (sid) => {
    const updated = { ...topic, subtasks: topic.subtasks.map(s => s.id === sid ? { ...s, isDone: !s.isDone } : s) }
    await updateTopic(updated)
  }

  const longTimers = useRef({})
  const startLongPress = (sid) => {
    longTimers.current[sid] = setTimeout(async () => {
      if (window.confirm('이 소주제를 삭제할까요?')) {
        const updated = { ...topic, subtasks: topic.subtasks.filter(s => s.id !== sid) }
        await updateTopic(updated)
      }
    }, 600)
  }
  const cancelLongPress = (sid) => clearTimeout(longTimers.current[sid])

  const done = topic.subtasks.filter(s => s.isDone).length
  const pct = topic.subtasks.length ? (done / topic.subtasks.length) * 100 : 0

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F2F3' }}>
      <div style={{ padding: '16px 20px', backgroundColor: '#F5F2F3' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <ChevronLeft size={24} color="#111" />
            </button>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: topic.color }} />
            <span style={{ fontWeight: 700, fontSize: 18 }}>{topic.title}</span>
          </div>
          <button onClick={handleDeleteTopic} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
            <Trash2 size={18} color="#FF6B6B" />
          </button>
        </div>
        <div style={{ paddingLeft: 44, fontSize: 12, color: '#aaa' }}>{topic.startDate} ~ {topic.endDate}</div>
        {topic.subtasks.length > 0 && (
          <div style={{ paddingLeft: 44, marginTop: 10 }}>
            <div style={{ height: 4, backgroundColor: '#ddd', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: topic.color, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 12, color: '#aaa', marginTop: 4, display: 'block' }}>{done} / {topic.subtasks.length}</span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
        {topic.subtasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa', fontSize: 15 }}>아직 등록된 내용이 없어요 ✦</div>
        ) : topic.subtasks.map(s => (
          <label
            key={s.id}
            onMouseDown={() => startLongPress(s.id)} onMouseUp={() => cancelLongPress(s.id)}
            onMouseLeave={() => cancelLongPress(s.id)} onTouchStart={() => startLongPress(s.id)}
            onTouchEnd={() => cancelLongPress(s.id)} onTouchCancel={() => cancelLongPress(s.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 4px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', userSelect: 'none' }}
          >
            <input
              type="checkbox" checked={s.isDone} onChange={() => toggleSubtask(s.id)}
              style={{ accentColor: '#111', width: 20, height: 20, cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ flex: 1, fontSize: 15, color: s.isDone ? '#aaa' : '#111', textDecoration: s.isDone ? 'line-through' : 'none', transition: 'all 0.2s' }}>
              {s.title}
            </span>
          </label>
        ))}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#ccc', marginTop: 16 }}>길게 누르면 삭제돼요</p>
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', gap: 10, backgroundColor: '#fff' }}>
        <input
          ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addSubtask()} placeholder="소주제 추가..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, backgroundColor: 'transparent', color: '#111' }}
        />
        <button onClick={addSubtask} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111', fontWeight: 700, fontSize: 14, padding: '0 4px' }}>
          추가
        </button>
      </div>
    </div>
  )
}
