import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Edit2, ChevronDown } from 'lucide-react'
import { genId, toDateStr, todayStr, COLOR_PALETTES, FAB, HOLIDAYS } from '../../constants'

const EVENT_COLORS = [
  '#FF6B6B', '#FF9F40', '#FFCD56', '#4BC0C0',
  '#36A2EB', '#9966FF', '#FF6384', '#4CAF50',
]

function getMonthWeeks(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const weeks = []
  let week = []
  for (let i = 0; i < first.getDay(); i++) {
    const d = new Date(year, month, 1 - (first.getDay() - i))
    week.push({ date: d, ds: toDateStr(d), isCurrent: false })
  }
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d)
    week.push({ date, ds: toDateStr(date), isCurrent: true })
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    let d = 1
    while (week.length < 7) {
      const date = new Date(year, month + 1, d++)
      week.push({ date, ds: toDateStr(date), isCurrent: false })
    }
    weeks.push(week)
  }
  return weeks
}

function getBarsForWeek(week, topics) {
  const bars = []
  const weekDates = week.map(d => d.ds)
  topics.filter(t => t.scheduleType !== 'always').forEach(t => {
    const inWeek = weekDates.filter(d => d >= t.startDate && d <= t.endDate)
    if (!inWeek.length) return
    bars.push({ topic: t, startIdx: weekDates.indexOf(inWeek[0]), endIdx: weekDates.indexOf(inWeek[inWeek.length - 1]) })
  })
  return bars
}

const shortDate = (ds) => {
  if (!ds) return ''
  const [, m, d] = ds.split('-')
  return `${parseInt(m)}/${parseInt(d)}`
}

const emptyForm = () => ({ title: '', scheduleType: 'fixed', startDate: todayStr(), endDate: todayStr(), colorIdx: 0 })

export default function Calendar({ navigate, topics, setTopics, saveTopic, deleteTopic, setPosts, setTodayPicks, todayPicks }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  // Topic modal: null | 'add' | { mode: 'edit', topic }
  const [topicModal, setTopicModal] = useState(null)
  const [topicForm, setTopicForm] = useState(emptyForm())

  // Subtasks
  const [expandedId, setExpandedId] = useState(null)
  const [editingSubtask, setEditingSubtask] = useState(null) // { topicId, subtaskId, text }
  const [newSubtaskText, setNewSubtaskText] = useState({})
  const [showPastTopics, setShowPastTopics] = useState(false)

  // Personal events
  const [events, setEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('events') || '[]') } catch { return [] }
  })
  const [eventModal, setEventModal] = useState(null)
  const [eventForm, setEventForm] = useState({ title: '', date: todayStr(), colorIdx: 0 })

  useEffect(() => { localStorage.setItem('events', JSON.stringify(events)) }, [events])

  const [selected, setSelected] = useState(null)

  const longPressTimer = useRef(null)
  const didLongPress = useRef(false)
  const eventLongPressTimer = useRef(null)

  const today = todayStr()
  const weeks = useMemo(() => getMonthWeeks(year, month), [year, month])

  const todayProgress = useMemo(() => {
    const pickedIds = todayPicks[today] || []
    let total = 0, done = 0
    topics.forEach(t => {
      const subs = t.scheduleType === 'always'
        ? t.subtasks
        : t.subtasks.filter(s => pickedIds.includes(s.id))
      total += subs.length
      done += subs.filter(s => s.isDone).length
    })
    return { total, done }
  }, [topics, todayPicks, today])

  const prevMonth = () => month === 0 ? (setYear(y => y - 1), setMonth(11)) : setMonth(m => m - 1)
  const nextMonth = () => month === 11 ? (setYear(y => y + 1), setMonth(0)) : setMonth(m => m + 1)

  // ── Topic CRUD ──────────────────────────────────────────

  const openAddTopic = () => {
    setTopicForm(emptyForm())
    setTopicModal('add')
  }

  const openEditTopic = (t) => {
    const colorIdx = COLOR_PALETTES.findIndex(p => p.dark === t.color)
    setTopicForm({
      title: t.title,
      scheduleType: t.scheduleType || 'fixed',
      startDate: t.startDate || todayStr(),
      endDate: t.endDate || todayStr(),
      colorIdx: colorIdx >= 0 ? colorIdx : 0,
    })
    setTopicModal({ mode: 'edit', topic: t })
  }

  const saveTopic_ = async () => {
    if (!topicForm.title.trim()) return
    const p = COLOR_PALETTES[topicForm.colorIdx]
    if (topicModal === 'add') {
      const t = {
        id: genId(),
        title: topicForm.title.trim(),
        color: p.dark,
        colorLight: p.light,
        scheduleType: topicForm.scheduleType,
        startDate: topicForm.scheduleType === 'fixed' ? topicForm.startDate : null,
        endDate: topicForm.scheduleType === 'fixed' ? topicForm.endDate : null,
        subtasks: [],
      }
      setTopics(prev => [...prev, t])
      await saveTopic(t, true)
    } else {
      const updated = {
        ...topicModal.topic,
        title: topicForm.title.trim(),
        color: p.dark,
        colorLight: p.light,
        scheduleType: topicForm.scheduleType,
        startDate: topicForm.scheduleType === 'fixed' ? topicForm.startDate : null,
        endDate: topicForm.scheduleType === 'fixed' ? topicForm.endDate : null,
      }
      setTopics(prev => prev.map(t => t.id === updated.id ? updated : t))
      await saveTopic(updated, false)
    }
    setTopicModal(null)
  }

  const deleteTopicFromModal = async () => {
    const t = topicModal.topic
    if (!window.confirm(`"${t.title}" 대주제를 삭제할까요?\n관련 게시글도 모두 삭제돼요.`)) return
    setTopics(prev => prev.filter(tp => tp.id !== t.id))
    setPosts(prev => prev.filter(p => p.topicId !== t.id))
    const subtaskIds = new Set(t.subtasks.map(s => s.id))
    setTodayPicks(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(d => { next[d] = next[d].filter(id => !subtaskIds.has(id)) })
      return next
    })
    await deleteTopic(t.id)
    setTopicModal(null)
  }

  // ── Subtask CRUD ─────────────────────────────────────────

  const updateTopicSubtasks = async (topicId, newSubtasks) => {
    let updated
    setTopics(prev => {
      updated = prev.map(t => t.id === topicId ? { ...t, subtasks: newSubtasks } : t)
      return updated
    })
    const t = topics.find(t => t.id === topicId)
    if (t) await saveTopic({ ...t, subtasks: newSubtasks }, false)
  }

  const toggleSubtask = (topicId, subtaskId) => {
    const t = topics.find(t => t.id === topicId)
    if (!t) return
    updateTopicSubtasks(topicId, t.subtasks.map(s => s.id === subtaskId ? { ...s, isDone: !s.isDone } : s))
  }

  const addSubtask = async (topicId) => {
    const text = (newSubtaskText[topicId] || '').trim()
    if (!text) return
    const t = topics.find(t => t.id === topicId)
    if (!t) return
    await updateTopicSubtasks(topicId, [...t.subtasks, { id: genId(), title: text, isDone: false }])
    setNewSubtaskText(p => ({ ...p, [topicId]: '' }))
  }

  const saveEditSubtask = async () => {
    if (!editingSubtask) return
    const { topicId, subtaskId, text } = editingSubtask
    const t = topics.find(t => t.id === topicId)
    if (!t) return
    await updateTopicSubtasks(topicId, t.subtasks.map(s => s.id === subtaskId ? { ...s, title: text } : s))
    setEditingSubtask(null)
  }

  const deleteSubtask = async (topicId, subtaskId) => {
    const t = topics.find(t => t.id === topicId)
    if (!t) return
    await updateTopicSubtasks(topicId, t.subtasks.filter(s => s.id !== subtaskId))
    setTodayPicks(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(d => { next[d] = next[d].filter(id => id !== subtaskId) })
      return next
    })
  }

  // ── Personal events ──────────────────────────────────────

  const handleDayPressStart = (ds) => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setEventForm({ title: '', date: ds, colorIdx: 0 })
      setEventModal({ mode: 'add' })
    }, 600)
  }

  const handleDayPressEnd = () => clearTimeout(longPressTimer.current)

  const handleDayClick = (ds) => {
    if (didLongPress.current) { didLongPress.current = false; return }
    const hasHoliday = !!HOLIDAYS[ds]
    const hasEvents = events.some(e => e.date === ds)
    if (hasHoliday || hasEvents) setSelected(ds)
  }

  const saveEvent = () => {
    if (!eventForm.title.trim()) return
    if (eventModal.mode === 'add') {
      setEvents(prev => [...prev, { id: genId(), title: eventForm.title.trim(), date: eventForm.date, color: EVENT_COLORS[eventForm.colorIdx] }])
    } else {
      setEvents(prev => prev.map(e => e.id === eventModal.id
        ? { ...e, title: eventForm.title.trim(), date: eventForm.date, color: EVENT_COLORS[eventForm.colorIdx] }
        : e
      ))
    }
    setEventModal(null)
  }

  const handleEventLongPress = (e) => {
    eventLongPressTimer.current = setTimeout(() => {
      if (window.confirm(`"${e.title}" 일정을 삭제할까요?`)) {
        setEvents(prev => prev.filter(ev => ev.id !== e.id))
      }
    }, 600)
  }

  const getEventsForDate = (ds) => events.filter(e => e.date === ds)

  const fabRight = 'max(16px, calc((100vw - 390px) / 2 + 16px))'
  const isEditMode = topicModal && topicModal !== 'add'

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100dvh - 64px)', paddingBottom: 40 }}>
      {/* ── 달력 ── */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ChevronLeft size={22} color="#111" /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 17 }}>{year}년 {month + 1}월</span>
            {(year !== now.getFullYear() || month !== now.getMonth()) && (
              <button
                onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()) }}
                style={{ fontSize: 12, color: '#888', background: '#eee', border: 'none', borderRadius: 8, padding: '3px 8px', cursor: 'pointer' }}
              >오늘</button>
            )}
          </div>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ChevronRight size={22} color="#111" /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {['일', '월', '화', '수', '목', '금', '토'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#aaa', paddingBottom: 8 }}>{d}</div>
          ))}
        </div>

        {weeks.map((week, wi) => {
          const bars = getBarsForWeek(week, topics)
          return (
            <div key={wi} style={{ marginBottom: 2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {week.map((day, di) => {
                  const isHoliday = !!HOLIDAYS[day.ds]
                  const isSunday = di === 0
                  const dayEvents = getEventsForDate(day.ds)
                  const isRed = isHoliday || isSunday
                  return (
                    <div
                      key={di}
                      onClick={() => handleDayClick(day.ds)}
                      onMouseDown={() => handleDayPressStart(day.ds)}
                      onMouseUp={handleDayPressEnd}
                      onMouseLeave={handleDayPressEnd}
                      onTouchStart={() => handleDayPressStart(day.ds)}
                      onTouchEnd={handleDayPressEnd}
                      style={{ textAlign: 'center', padding: '4px 0', userSelect: 'none', cursor: 'pointer' }}
                    >
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 30, height: 30, borderRadius: '50%',
                        backgroundColor: day.ds === today ? '#111' : 'transparent',
                        color: day.ds === today ? '#fff'
                          : !day.isCurrent ? '#ccc'
                          : isRed ? '#FF4444'
                          : '#111',
                        fontSize: 13, fontWeight: day.ds === today ? 700 : 400,
                      }}>{day.date.getDate()}</span>
                      {day.ds === today && todayProgress.total > 0 ? (
                        <div style={{ marginTop: 3, padding: '0 4px' }}>
                          <div style={{ height: 3, backgroundColor: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(todayProgress.done / todayProgress.total) * 100}%`, backgroundColor: todayProgress.done === todayProgress.total ? '#3DE87A' : '#111', borderRadius: 2, transition: 'width 0.3s' }} />
                          </div>
                          <div style={{ fontSize: 9, color: '#aaa', textAlign: 'center', marginTop: 1 }}>{todayProgress.done}/{todayProgress.total}</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2, minHeight: 6 }}>
                          {isHoliday && <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#FF4444', flexShrink: 0 }} />}
                          {dayEvents.slice(0, isHoliday ? 2 : 3).map(e => (
                            <div key={e.id} style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: e.color, flexShrink: 0 }} />
                          ))}
                          {dayEvents.length > (isHoliday ? 2 : 3) && (
                            <span style={{ fontSize: 8, color: '#aaa', lineHeight: '4px' }}>+{dayEvents.length - (isHoliday ? 2 : 3)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {bars.length > 0 && (
                <div style={{ position: 'relative', height: bars.length * 10 + 2, marginBottom: 2 }}>
                  {bars.map((bar, bi) => (
                    <div key={bar.topic.id} style={{
                      position: 'absolute',
                      left: `${(bar.startIdx / 7) * 100}%`,
                      width: `${((bar.endIdx - bar.startIdx + 1) / 7) * 100}%`,
                      top: bi * 10, height: 6, backgroundColor: bar.topic.color, borderRadius: 3,
                    }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── 구분선 + 대주제 카드 목록 ── */}
      <div style={{ margin: '20px 0 0', borderTop: '1px solid #e8e8e8' }} />
      <div style={{ padding: '16px 16px 0' }}>
        {topics.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: 14, padding: '24px 0' }}>대주제가 없어요. 추가해보세요 ✦</p>
        ) : (() => {
          const activeTopics = topics.filter(t => t.scheduleType === 'always' || !t.endDate || t.endDate >= today)
          const pastTopics = topics.filter(t => t.scheduleType === 'fixed' && t.endDate && t.endDate < today)
          const renderTopicCard = (t) => {
            const isExpanded = expandedId === t.id
            const done = t.subtasks.filter(s => s.isDone).length
            return (
              <div key={t.id} style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 12px 14px 16px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: t.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: 15, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  {t.scheduleType === 'always' ? (
                    <span style={{ backgroundColor: '#eee', color: '#aaa', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 8, flexShrink: 0 }}>상시</span>
                  ) : (
                    <span style={{ fontSize: 12, color: '#aaa', flexShrink: 0 }}>{shortDate(t.startDate)} ~ {shortDate(t.endDate)}</span>
                  )}
                  <button onClick={() => openEditTopic(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                    <Edit2 size={14} color="#bbb" />
                  </button>
                  <button onClick={() => setExpandedId(isExpanded ? null : t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <ChevronDown size={16} color="#bbb" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #f0f0f0', padding: '12px 16px 16px', backgroundColor: t.colorLight || '#fafafa' }}>
                    {t.subtasks.length === 0 && (
                      <p style={{ fontSize: 13, color: '#bbb', marginBottom: 12, textAlign: 'center' }}>소주제가 없어요</p>
                    )}
                    {t.subtasks.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <input type="checkbox" checked={s.isDone} onChange={() => toggleSubtask(t.id, s.id)}
                          style={{ accentColor: t.color, width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />
                        {editingSubtask?.subtaskId === s.id ? (
                          <input value={editingSubtask.text} onChange={e => setEditingSubtask(p => ({ ...p, text: e.target.value }))}
                            onBlur={saveEditSubtask} onKeyDown={e => e.key === 'Enter' && saveEditSubtask()} autoFocus
                            style={{ flex: 1, border: 'none', borderBottom: '1.5px solid #ccc', outline: 'none', fontSize: 14, padding: '2px 0', backgroundColor: 'transparent' }} />
                        ) : (
                          <span style={{ flex: 1, fontSize: 14, color: s.isDone ? '#bbb' : '#111', textDecoration: s.isDone ? 'line-through' : 'none', minWidth: 0 }}>{s.title}</span>
                        )}
                        <button onClick={() => setEditingSubtask({ topicId: t.id, subtaskId: s.id, text: s.title })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                          <Edit2 size={12} color="#bbb" />
                        </button>
                        <button onClick={() => deleteSubtask(t.id, s.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                          <X size={12} color="#bbb" />
                        </button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <input value={newSubtaskText[t.id] || ''} onChange={e => setNewSubtaskText(p => ({ ...p, [t.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addSubtask(t.id)} placeholder="소주제 추가..."
                        style={{ flex: 1, border: 'none', borderBottom: '1.5px solid #ddd', outline: 'none', fontSize: 13, padding: '4px 0', backgroundColor: 'transparent' }} />
                      <button onClick={() => addSubtask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                        <Plus size={16} color="#888" />
                      </button>
                    </div>
                    {t.subtasks.length > 0 && (
                      <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>{done} / {t.subtasks.length} 완료</div>
                    )}
                  </div>
                )}
              </div>
            )
          }
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeTopics.map(renderTopicCard)}
              {pastTopics.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <button
                    onClick={() => setShowPastTopics(p => !p)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 2px', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span style={{ fontSize: 12, color: '#bbb' }}>지난 목록 ({pastTopics.length})</span>
                    <ChevronDown size={13} color="#bbb" style={{ transform: showPastTopics ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {showPastTopics && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: 0.6 }}>
                      {pastTopics.map(renderTopicCard)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })()}
      </div>

      {/* ── 공휴일/개인 일정 바텀시트 ── */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div onClick={() => setSelected(null)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, margin: '0 auto', maxWidth: 390, backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '60dvh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{selected}</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {HOLIDAYS[selected] && (
              <div style={{ fontSize: 13, color: '#FF4444', fontWeight: 600, marginBottom: 16 }}>{HOLIDAYS[selected]}</div>
            )}
            {events.filter(e => e.date === selected).length > 0 && (
              <div style={{ marginTop: HOLIDAYS[selected] ? 0 : 12 }}>
                <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 8 }}>개인 일정</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {events.filter(e => e.date === selected).map(e => (
                    <div
                      key={e.id}
                      onClick={() => { const colorIdx = EVENT_COLORS.indexOf(e.color); setEventForm({ title: e.title, date: e.date, colorIdx: colorIdx >= 0 ? colorIdx : 0 }); setEventModal({ mode: 'edit', id: e.id }); setSelected(null) }}
                      onMouseDown={() => { eventLongPressTimer.current = setTimeout(() => { if (window.confirm(`"${e.title}" 일정을 삭제할까요?`)) { setEvents(prev => prev.filter(ev => ev.id !== e.id)) } }, 600) }}
                      onMouseUp={() => clearTimeout(eventLongPressTimer.current)}
                      onMouseLeave={() => clearTimeout(eventLongPressTimer.current)}
                      onTouchStart={() => { eventLongPressTimer.current = setTimeout(() => { if (window.confirm(`"${e.title}" 일정을 삭제할까요?`)) { setEvents(prev => prev.filter(ev => ev.id !== e.id)) } }, 600) }}
                      onTouchEnd={() => clearTimeout(eventLongPressTimer.current)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', backgroundColor: '#f8f8f8', borderRadius: 12, cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: e.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{e.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={openAddTopic} style={{ ...FAB, position: 'fixed', bottom: 80, right: fabRight, zIndex: 20 }}>
        <Plus size={24} color="white" />
      </button>

      {/* ── 대주제 추가/수정 모달 ── */}
      {topicModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 390, margin: '0 auto', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', maxHeight: '90dvh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{isEditMode ? '대주제 수정' : '대주제 추가'}</span>
              <button onClick={() => setTopicModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* 제목 */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>제목</label>
              <input value={topicForm.title} onChange={e => setTopicForm(p => ({ ...p, title: e.target.value }))} placeholder="대주제 이름" autoFocus
                style={{ width: '100%', border: '1.5px solid #eee', borderRadius: 12, padding: '10px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* 기간 탭 */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 8 }}>기간</label>
              <div style={{ display: 'flex', border: '1.5px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
                {[['always', '상시'], ['fixed', '날짜 지정']].map(([type, label]) => (
                  <button key={type}
                    onClick={() => setTopicForm(p => ({ ...p, scheduleType: type }))}
                    style={{
                      flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      backgroundColor: topicForm.scheduleType === type ? '#111' : 'transparent',
                      color: topicForm.scheduleType === type ? '#fff' : '#aaa',
                      transition: 'all 0.15s',
                    }}
                  >{label}</button>
                ))}
              </div>
            </div>

            {/* 날짜 지정일 때만 표시 */}
            {topicForm.scheduleType === 'fixed' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[['시작일', 'startDate'], ['종료일', 'endDate']].map(([label, key]) => (
                  <div key={key} style={{ minWidth: 0 }}>
                    <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>{label}</label>
                    <input type="date" value={topicForm[key]} onChange={e => setTopicForm(p => ({ ...p, [key]: e.target.value }))}
                      style={{ width: '100%', border: '1.5px solid #eee', borderRadius: 12, padding: '10px 8px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            )}

            {/* 색상 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 8 }}>색상</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLOR_PALETTES.map((p, i) => (
                  <button key={i} onClick={() => setTopicForm(prev => ({ ...prev, colorIdx: i }))}
                    style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: p.dark, border: topicForm.colorIdx === i ? '3px solid #111' : '3px solid transparent', cursor: 'pointer', outline: topicForm.colorIdx === i ? '2px solid #fff' : 'none', outlineOffset: -5 }} />
                ))}
              </div>
            </div>

            <button onClick={saveTopic_} style={{ width: '100%', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginBottom: isEditMode ? 10 : 0 }}>
              {isEditMode ? '저장하기' : '추가하기'}
            </button>
            {isEditMode && (
              <button onClick={deleteTopicFromModal} style={{ width: '100%', backgroundColor: 'transparent', color: '#FF6B6B', border: '1.5px solid #FFD0D0', borderRadius: 14, padding: '13px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                삭제하기
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 개인 일정 추가/수정 모달 ── */}
      {eventModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 390, margin: '0 auto', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', maxHeight: '90dvh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{eventModal.mode === 'add' ? '일정 추가' : '일정 수정'}</span>
              <button onClick={() => setEventModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>제목</label>
              <input value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} placeholder="일정 이름" autoFocus
                style={{ width: '100%', border: '1.5px solid #eee', borderRadius: 12, padding: '10px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>날짜</label>
              <input type="date" value={eventForm.date} onChange={e => setEventForm(p => ({ ...p, date: e.target.value }))}
                style={{ width: '100%', border: '1.5px solid #eee', borderRadius: 12, padding: '10px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 8 }}>색상</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EVENT_COLORS.map((c, i) => (
                  <button key={i} onClick={() => setEventForm(prev => ({ ...prev, colorIdx: i }))}
                    style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: c, border: eventForm.colorIdx === i ? '3px solid #111' : '3px solid transparent', cursor: 'pointer', outline: eventForm.colorIdx === i ? '2px solid #fff' : 'none', outlineOffset: -5 }} />
                ))}
              </div>
            </div>
            <button onClick={saveEvent} style={{ width: '100%', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              {eventModal.mode === 'add' ? '추가하기' : '저장하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
