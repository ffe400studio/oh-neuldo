import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { genId, toDateStr, todayStr, COLOR_PALETTES, FAB } from '../../constants'

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
    bars.push({
      topic: t,
      startIdx: weekDates.indexOf(inWeek[0]),
      endIdx: weekDates.indexOf(inWeek[inWeek.length - 1]),
    })
  })
  return bars
}

export default function Calendar({ navigate, topics, setTopics }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    title: '',
    startDate: todayStr(),
    endDate: todayStr(),
    colorIdx: 0,
  })

  const today = todayStr()
  const weeks = useMemo(() => getMonthWeeks(year, month), [year, month])

  const prevMonth = () => month === 0 ? (setYear(y => y - 1), setMonth(11)) : setMonth(m => m - 1)
  const nextMonth = () => month === 11 ? (setYear(y => y + 1), setMonth(0)) : setMonth(m => m + 1)

  const selectedTopics = selected ? topics.filter(t => t.startDate <= selected && t.endDate >= selected) : []

  const addTopic = () => {
    if (!form.title.trim()) return
    const p = COLOR_PALETTES[form.colorIdx]
    setTopics(prev => [...prev, {
      id: genId(),
      title: form.title.trim(),
      color: p.dark,
      colorLight: p.light,
      startDate: form.startDate,
      endDate: form.endDate,
      subtasks: [],
    }])
    setForm({ title: '', startDate: todayStr(), endDate: todayStr(), colorIdx: 0 })
    setShowAdd(false)
  }

  const fabRight = 'max(16px, calc((100vw - 390px) / 2 + 16px))'

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100dvh - 64px)' }}>
      <div style={{ padding: '20px 16px' }}>
        {/* 월 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronLeft size={22} color="#111" />
          </button>
          <span style={{ fontWeight: 700, fontSize: 17 }}>{year}년 {month + 1}월</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronRight size={22} color="#111" />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {['일', '월', '화', '수', '목', '금', '토'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#aaa', paddingBottom: 8 }}>{d}</div>
          ))}
        </div>

        {/* 주 행 */}
        {weeks.map((week, wi) => {
          const bars = getBarsForWeek(week, topics)
          return (
            <div key={wi} style={{ marginBottom: 2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {week.map((day, di) => (
                  <div
                    key={di}
                    onClick={() => setSelected(day.ds)}
                    style={{ textAlign: 'center', padding: '4px 0', cursor: 'pointer' }}
                  >
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: day.ds === today ? '#111' : day.ds === selected ? '#eee' : 'transparent',
                      color: day.ds === today ? '#fff' : day.isCurrent ? '#111' : '#ccc',
                      fontSize: 13,
                      fontWeight: day.ds === today ? 700 : 400,
                    }}>
                      {day.date.getDate()}
                    </span>
                  </div>
                ))}
              </div>
              {bars.length > 0 && (
                <div style={{ position: 'relative', height: bars.length * 10 + 2, marginBottom: 2 }}>
                  {bars.map((bar, bi) => (
                    <div key={bar.topic.id} style={{
                      position: 'absolute',
                      left: `${(bar.startIdx / 7) * 100}%`,
                      width: `${((bar.endIdx - bar.startIdx + 1) / 7) * 100}%`,
                      top: bi * 10,
                      height: 6,
                      backgroundColor: bar.topic.color,
                      borderRadius: 3,
                      paddingLeft: 2,
                      paddingRight: 2,
                    }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        style={{ ...FAB, position: 'fixed', bottom: 80, right: fabRight, zIndex: 20 }}
      >
        <Plus size={24} color="white" />
      </button>

      {/* 날짜 바텀 시트 */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
          <div
            onClick={() => setSelected(null)}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            margin: '0 auto',
            maxWidth: 390,
            backgroundColor: '#fff',
            borderRadius: '20px 20px 0 0',
            padding: '20px 20px 40px',
            maxHeight: '70dvh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{selected}</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            {selectedTopics.length === 0 ? (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0', fontSize: 14 }}>
                이 날짜에 걸친 대주제가 없어요 ✦
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedTopics.map(t => {
                  const done = t.subtasks.filter(s => s.isDone).length
                  const pct = t.subtasks.length ? (done / t.subtasks.length) * 100 : 0
                  return (
                    <div
                      key={t.id}
                      onClick={() => { setSelected(null); navigate('TopicDetail', { topicId: t.id }) }}
                      style={{
                        backgroundColor: t.colorLight,
                        borderRadius: 16,
                        padding: 16,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: t.color, flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{t.title}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: t.subtasks.length ? 10 : 0 }}>
                        {t.startDate} ~ {t.endDate}
                      </div>
                      {t.subtasks.length > 0 && (
                        <>
                          <div style={{ height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: t.color, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#666' }}>{done} / {t.subtasks.length}</span>
                        </>
                      )}
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
          <div style={{
            width: '100%',
            maxWidth: 390,
            margin: '0 auto',
            backgroundColor: '#fff',
            borderRadius: '20px 20px 0 0',
            padding: '24px 20px 40px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>대주제 추가</span>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>제목</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="대주제 이름"
                autoFocus
                style={{
                  width: '100%',
                  border: '1.5px solid #eee',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[['시작일', 'startDate'], ['종료일', 'endDate']].map(([label, key]) => (
                <div key={key}>
                  <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input
                    type="date"
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{
                      width: '100%',
                      border: '1.5px solid #eee',
                      borderRadius: 12,
                      padding: '10px 10px',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 8 }}>색상</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLOR_PALETTES.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setForm(prev => ({ ...prev, colorIdx: i }))}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: p.dark,
                      border: form.colorIdx === i ? '3px solid #111' : '3px solid transparent',
                      cursor: 'pointer',
                      outline: form.colorIdx === i ? '2px solid #fff' : 'none',
                      outlineOffset: -5,
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={addTopic}
              style={{
                width: '100%',
                backgroundColor: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                padding: '14px 0',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              추가하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
