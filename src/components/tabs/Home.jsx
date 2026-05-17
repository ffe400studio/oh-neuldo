import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { todayStr, formatDate, CARD } from '../../constants'

export default function Home({
  navigate,
  resolutions, activeResolutionId,
  topics, setTopics,
  todayPicks,
}) {
  const today = todayStr()

  const activeResolution = useMemo(() => {
    if (!resolutions.length) return null
    return resolutions.find(r => r.id === activeResolutionId) || resolutions[0]
  }, [resolutions, activeResolutionId])

  const pickedIds = todayPicks[today] || []

  const todayTopics = useMemo(() => {
    return topics
      .filter(t => t.startDate <= today && t.endDate >= today)
      .map(t => ({
        topic: t,
        subtasks: t.subtasks.filter(s => pickedIds.includes(s.id)),
      }))
      .filter(({ subtasks }) => subtasks.length > 0)
  }, [topics, today, pickedIds])

  const totalCount = todayTopics.reduce((sum, { subtasks }) => sum + subtasks.length, 0)
  const doneCount = todayTopics.reduce((sum, { subtasks }) => sum + subtasks.filter(s => s.isDone).length, 0)

  const toggleSubtask = (topicId, subtaskId) => {
    setTopics(prev => prev.map(t =>
      t.id === topicId
        ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, isDone: !s.isDone } : s) }
        : t
    ))
  }

  return (
    <div style={{ padding: '0 16px 20px' }}>
      {/* 앱 타이틀 */}
      <div style={{ padding: '20px 4px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#aaa', letterSpacing: '0.08em' }}>Oh-neuldo</span>
        <span style={{ fontSize: 13, color: '#aaa' }}>{formatDate(today)}</span>
      </div>

      {/* 결심 배너 */}
      <div
        onClick={() => navigate('ResolutionManager')}
        style={{
          backgroundColor: '#111111',
          borderRadius: 20,
          padding: '20px 20px 16px',
          marginBottom: 20,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 10, fontWeight: 500 }}>
          오늘의 결심
        </div>
        <div style={{
          color: '#fff',
          fontSize: 17,
          fontWeight: 600,
          lineHeight: 1.55,
          minHeight: 52,
          wordBreak: 'keep-all',
        }}>
          {activeResolution ? activeResolution.text : '아직 결심이 없어요. 추가해보세요 ✦'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {resolutions.slice(0, 8).map(r => (
              <div key={r.id} style={{
                width: 6, height: 6, borderRadius: '50%',
                backgroundColor: r.id === (activeResolution?.id) ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            결심 관리 <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* 오늘의 할일 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>오늘의 할일</span>
        {totalCount > 0 && (
          <span style={{ fontSize: 12, color: '#aaa' }}>
            {totalCount}개 중 {doneCount}개 완료
          </span>
        )}
      </div>

      {pickedIds.length === 0 ? (
        <div style={{
          ...CARD,
          padding: '36px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          <p style={{ color: '#aaa', fontSize: 15 }}>오늘 할일을 골라보세요</p>
          <button
            onClick={() => navigate('TodayPicker')}
            style={{
              backgroundColor: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            할일 선택하기
          </button>
        </div>
      ) : todayTopics.length === 0 ? (
        <div style={{ ...CARD, padding: '36px 20px', textAlign: 'center' }}>
          <p style={{ color: '#aaa', fontSize: 15 }}>선택한 할일이 없어요 ✦</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {todayTopics.map(({ topic, subtasks }) => {
            const done = subtasks.filter(s => s.isDone).length
            const pct = subtasks.length ? (done / subtasks.length) * 100 : 0
            return (
              <div key={topic.id} style={{ ...CARD, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: topic.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{topic.title}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {subtasks.map(s => (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={s.isDone}
                        onChange={() => toggleSubtask(topic.id, s.id)}
                        style={{ accentColor: '#111', width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
                      />
                      <span style={{
                        fontSize: 15,
                        color: s.isDone ? '#aaa' : '#111',
                        textDecoration: s.isDone ? 'line-through' : 'none',
                        transition: 'all 0.2s',
                      }}>
                        {s.title}
                      </span>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ height: 4, backgroundColor: '#eee', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: topic.color,
                      borderRadius: 2,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#aaa' }}>{done} / {subtasks.length}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pickedIds.length > 0 && (
        <button
          onClick={() => navigate('TodayPicker')}
          style={{
            marginTop: 12,
            width: '100%',
            border: '1.5px dashed #ddd',
            borderRadius: 14,
            padding: '12px 0',
            fontSize: 13,
            color: '#aaa',
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
        >
          할일 다시 선택하기
        </button>
      )}
    </div>
  )
}
