import { useState } from 'react'
import { todayStr } from '../../constants'

export default function TodayPicker({ goBack, topics, todayPicks, setTodayPicks }) {
  const today = todayStr()
  const existing = todayPicks[today] || []

  const [selected, setSelected] = useState(new Set(existing))

  const todayTopics = topics.filter(t => t.startDate <= today && t.endDate >= today)

  const toggle = (sid) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(sid)) next.delete(sid)
      else next.add(sid)
      return next
    })
  }

  const confirm = () => {
    setTodayPicks(prev => ({ ...prev, [today]: [...selected] }))
    goBack()
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F2F3' }}>
      {/* 헤더 */}
      <div style={{ padding: '24px 20px 12px' }}>
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 6 }}>{today}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0 }}>오늘 뭐 할까요?</h2>
      </div>

      {/* 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 120px' }}>
        {todayTopics.length === 0 ? (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            boxShadow: '0px 4px 16px rgba(0,0,0,0.10)',
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#aaa', fontSize: 15, marginBottom: 8 }}>오늘에 걸친 대주제가 없어요 ✦</p>
            <p style={{ color: '#bbb', fontSize: 13 }}>캘린더에서 대주제를 추가해보세요</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {todayTopics.map(t => (
              <div key={t.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingLeft: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: t.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{t.title}</span>
                </div>
                {t.subtasks.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#bbb', paddingLeft: 20 }}>소주제가 없어요</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {t.subtasks.map(s => {
                      const isSelected = selected.has(s.id)
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggle(s.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '13px 16px',
                            borderRadius: 16,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#111' : '#fff',
                            boxShadow: '0px 2px 8px rgba(0,0,0,0.07)',
                            textAlign: 'left',
                            transition: 'background 0.15s',
                          }}
                        >
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            border: isSelected ? 'none' : '2px solid #ddd',
                            backgroundColor: isSelected ? t.color : 'transparent',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}>
                            {isSelected && (
                              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span style={{
                            fontSize: 15,
                            color: isSelected ? '#fff' : '#111',
                            fontWeight: isSelected ? 600 : 400,
                          }}>
                            {s.title}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 확정 버튼 */}
      <div style={{ padding: '16px 16px 32px', backgroundColor: '#F5F2F3' }}>
        <button
          onClick={confirm}
          style={{
            width: '100%',
            backgroundColor: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '16px 0',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}
        >
          오늘 할일 확정 ({selected.size}개)
        </button>
        {existing.length > 0 && (
          <button
            onClick={goBack}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: '#aaa',
              border: 'none',
              padding: '12px 0 0',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        )}
      </div>
    </div>
  )
}
