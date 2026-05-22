import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react'
import { genId, toDateStr, todayStr, COLOR_PALETTES, FAB } from '../../constants'

const HOLIDAYS = {
  '2025-01-01': '신정',
  '2025-01-28': '설날 연휴',
  '2025-01-29': '설날',
  '2025-01-30': '설날 연휴',
  '2025-03-01': '삼일절',
  '2025-05-05': '어린이날',
  '2025-05-06': '대체공휴일',
  '2025-06-06': '현충일',
  '2025-08-15': '광복절',
  '2025-10-05': '추석 연휴',
  '2025-10-06': '추석',
  '2025-10-07': '추석 연휴',
  '2025-10-08': '대체공휴일',
  '2025-10-09': '한글날',
  '2025-12-25': '성탄절',
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴',
  '2026-02-17': '설날',
  '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절',
  '2026-05-05': '어린이날',
  '2026-06-06': '현충일',
  '2026-08-15': '광복절',
  '2026-09-23': '추석 연휴',
  '2026-09-24': '추석',
  '2026-09-25': '추석 연휴',
  '2026-10-03': '개천절',
  '2026-10-09': '한글날',
  '2026-12-25': '성탄절',
}

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
  topics.forEach(t => {
    const inWeek = weekDates.filter(d => d >= t.startDate && d <= t.endDate)
    if (!inWeek.length) return
    bars.push({ topic: t, startIdx: weekDates.indexOf(inWeek[0]), endIdx: weekDates.indexOf(inWeek[inWeek.length - 1]) })
  })
  return bars
}

export default function Calendar({ navigate, topics, setTopics, saveTopic, deleteTopic, setPosts, setTodayPicks, todayPicks }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', startDate: todayStr(), endDate: todayStr(), colorIdx: 0 })

  const [events, setEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('events') || '[]') } catch { return [] }
  })
  const [eventModal, setEventModal] = useState(null) // null | { mode: 'add'|'edit', event }
  const [eventForm, setEventForm] = useState({ title: '', date: todayStr(), colorIdx: 0 })

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events))
  }, [events])

  const longPressTimer = useRef(null)
  const didLongPress = useRef(false)
  const eventLongPressTimer = useRef(null)

  const today = todayStr()
  const weeks = useMemo(() => getMonthWeeks(year, month), [year, month])

  const prevMonth = () => month === 0 ? (setYear(y => y - 1), setMonth(11)) : setMonth(m => m - 1)
  const nextMonth = () => month === 11 ? (setYear(y => y + 1), setMonth(0)) : setMonth(m => m + 1)

  const selectedTopics = selected ? topics.filter(t => t.startDate <= selected && t.endDate >= selected) : []
  const selectedEvents = selected ? events.filter(e => e.date === selected) : []
  const selectedHoliday = selected ? HOLIDAYS[selected] : null

  const handleDeleteTopic = async (t) => {
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
  }

  const addTopic = async () => {
    if (!form.title.trim()) return
    const p = COLOR_PALETTES[form.colorIdx]
    const t = { id: genId(), title: form.title.trim(), color: p.dark, colorLight: p.light, startDate: form.startDate, endDate: form.endDate, subtasks: [] }
    setTopics(prev => [...prev, t])
    await saveTopic(t, true)
    setForm({ title: '', startDate: todayStr(), endDate: todayStr(), colorIdx: 0 })
    setShowAdd(false)
  }

  const handleDayPressStart = (ds) => {
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setEventForm({ title: '', date: ds, colorIdx: 0 })
      setEventModal({ mode: 'add' })
    }, 600)
  }

  const handleDayPressEnd = () => {
    clearTimeout(longPressTimer.current)
  }

  const handleDayClick = (ds) => {
    if (didLongPress.current) { didLongPress.current = false; return }
    setSelected(ds)
  }

  const saveEvent = () => {
    if (!eventForm.title.trim()) return
    if (eventModal.mode === 'add') {
      const e = { id: genId(), title: eventForm.title.trim(), date: eventForm.date, color: EVENT_COLORS[eventForm.colorIdx] }
      setEvents(prev => [...prev, e])
    } else {
      setEvents(prev => prev.map(e => e.id === eventModal.id
        ? { ...e, title: eventForm.title.trim(), date: eventForm.date, color: EVENT_COLORS[eventForm.colorIdx] }
        : e
      ))
    }
    setEventModal(null)
  }

  const openEditEvent = (e) => {
    const colorIdx = EVENT_COLORS.indexOf(e.color)
    setEventForm({ title: e.title, date: e.date, colorIdx: colorIdx >= 0 ? colorIdx : 0 })
    setEventModal({ mode: 'edit', id: e.id })
  }

  const handleEventLongPress = (e) => {
    eventLongPressTimer.current = setTimeout(() => {
      if (window.confirm(`"${e.title}" 일정을 삭제할까요?`)) {
        setEvents(prev => prev.filter(ev => ev.id !== e.id))
      }
    }, 600)
  }

  const handleEventPressEnd = () => {
    clearTimeout(eventLongPressTimer.current)
  }

  const getEventsForDate = (ds) => events.filter(e => e.date === ds)

  const fabRight = 'max(16px, calc((100vw - 390px) / 2 + 16px))'

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100dvh - 64px)' }}>
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ChevronLeft size={22} color="#111" /></button>
          <span style={{ fontWeight: 700, fontSize: 17 }}>{year}년 {month + 1}월</span>
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
                      style={{ textAlign: 'center', padding: '4px 0', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 30, height: 30, borderRadius: '50%',
                        backgroundColor: day.ds === today ? '#111' : day.ds === selected ? '#eee' : 'transparent',
                        color: day.ds === today ? '#fff'
                          : !day.isCurrent ? '#ccc'
                          : isRed ? '#FF4444'
                          : '#111',
                        fontSize: 13, fontWeight: day.ds === today ? 700 : 400,
                      }}>{day.date.getDate()}</span>
                      {/* dots: holiday + events */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2, minHeight: 6 }}>
                        {isHoliday && (
                          <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#FF4444', flexShrink: 0 }} />
                        )}
                        {dayEvents.slice(0, isHoliday ? 2 : 3).map(e => (
                          <div key={e.id} style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: e.color, flexShrink: 0 }} />
                        ))}
                        {dayEvents.length > (isHoliday ? 2 : 3) && (
                          <span style={{ fontSize: 8, color: '#aaa', lineHeight: '4px' }}>+{dayEvents.length - (isHoliday ? 2 : 3)}</span>
                        )}
                      </div>
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

      <button onClick={() => setShowAdd(true)} style={{ ...FAB, position: 'fixed', bottom: 80, right: fabRight, zIndex: 20 }}>
        <Plus size={24} color="white" />
      </button>

      {/* 날짜 바텀 시트 */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div onClick={() => setSelected(null)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, margin: '0 auto', maxWidth: 390, backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '70dvh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{selected}</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* 공휴일 이름 */}
            {selectedHoliday && (
              <div style={{ fontSize: 13, color: '#FF4444', fontWeight: 600, marginBottom: 16 }}>{selectedHoliday}</div>
            )}
            {!selectedHoliday && <div style={{ marginBottom: 12 }} />}

            {/* 개인 일정 */}
            {selectedEvents.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 8 }}>개인 일정</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedEvents.map(e => (
                    <div
                      key={e.id}
                      onClick={() => openEditEvent(e)}
                      onMouseDown={() => handleEventLongPress(e)}
                      onMouseUp={handleEventPressEnd}
                      onMouseLeave={handleEventPressEnd}
                      onTouchStart={() => handleEventLongPress(e)}
                      onTouchEnd={handleEventPressEnd}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', backgroundColor: '#f8f8f8', borderRadius: 12, cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: e.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>{e.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 대주제 카드 */}
            {selectedTopics.length === 0 && selectedEvents.length === 0 && !selectedHoliday ? (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0', fontSize: 14 }}>이 날짜에 걸친 대주제가 없어요 ✦</p>
            ) : selectedTopics.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedTopics.map(t => {
                  const done = t.subtasks.filter(s => s.isDone).length
                  const pct = t.subtasks.length ? (done / t.subtasks.length) * 100 : 0
                  return (
                    <div key={t.id} style={{ backgroundColor: t.colorLight, borderRadius: 16, padding: 16, position: 'relative' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTopic(t) }}
                        style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      ><Trash2 size={13} color="#555" /></button>
                      <div onClick={() => { setSelected(null); navigate('TopicDetail', { topicId: t.id }) }} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, paddingRight: 32 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: t.color, flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{t.title}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: t.subtasks.length ? 10 : 0 }}>{t.startDate} ~ {t.endDate}</div>
                        {t.subtasks.length > 0 && (
                          <>
                            <div style={{ height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
                              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: t.color, borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 11, color: '#666' }}>{done} / {t.subtasks.length}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 대주제 추가 모달 */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 390, margin: '0 auto', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', maxHeight: '90dvh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>대주제 추가</span>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>제목</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="대주제 이름" autoFocus
                style={{ width: '100%', border: '1.5px solid #eee', borderRadius: 12, padding: '10px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[['시작일', 'startDate'], ['종료일', 'endDate']].map(([label, key]) => (
                <div key={key} style={{ minWidth: 0 }}>
                  <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type="date" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: '100%', border: '1.5px solid #eee', borderRadius: 12, padding: '10px 8px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 8 }}>색상</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLOR_PALETTES.map((p, i) => (
                  <button key={i} onClick={() => setForm(prev => ({ ...prev, colorIdx: i }))}
                    style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: p.dark, border: form.colorIdx === i ? '3px solid #111' : '3px solid transparent', cursor: 'pointer', outline: form.colorIdx === i ? '2px solid #fff' : 'none', outlineOffset: -5 }} />
                ))}
              </div>
            </div>
            <button onClick={addTopic} style={{ width: '100%', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              추가하기
            </button>
          </div>
        </div>
      )}

      {/* 개인 일정 추가/수정 모달 */}
      {eventModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 390, margin: '0 auto', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px' }}>
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
