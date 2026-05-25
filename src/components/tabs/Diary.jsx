import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CARD, FAB } from '../../constants'

export default function Diary({ navigate, diaries }) {
  const sorted = [...diaries].sort((a, b) => b.date.localeCompare(a.date))
  const [filterMonth, setFilterMonth] = useState(null)

  const months = [...new Set(sorted.map(d => d.date.slice(0, 7)))].sort().reverse()
  const filtered = filterMonth ? sorted.filter(d => d.date.startsWith(filterMonth)) : sorted

  const fabRight = 'max(16px, calc((100vw - 390px) / 2 + 16px))'

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100dvh - 64px)', padding: '20px 16px' }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>일기</div>

      {/* 월별 필터 */}
      {months.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 2, scrollbarWidth: 'none' }}>
          <button
            onClick={() => setFilterMonth(null)}
            style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, backgroundColor: filterMonth === null ? '#111' : '#eee', color: filterMonth === null ? '#fff' : '#888' }}
          >전체</button>
          {months.map(m => {
            const [y, mo] = m.split('-')
            return (
              <button
                key={m}
                onClick={() => setFilterMonth(filterMonth === m ? null : m)}
                style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, backgroundColor: filterMonth === m ? '#111' : '#eee', color: filterMonth === m ? '#fff' : '#888' }}
              >{parseInt(y)}년 {parseInt(mo)}월</button>
            )
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ ...CARD, padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: '#aaa', fontSize: 15 }}>아직 등록된 내용이 없어요 ✦</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(diary => (
            <div
              key={diary.id}
              onClick={() => navigate('DiaryDetail', { diaryId: diary.id })}
              style={{ ...CARD, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
            >
              <div style={{ backgroundColor: '#111', borderRadius: 12, padding: '8px 10px', textAlign: 'center', flexShrink: 0, minWidth: 46 }}>
                {(() => {
                  const [y, m, d] = diary.date.split('-')
                  return (
                    <>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{y}</div>
                      <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{parseInt(m)}/{parseInt(d)}</div>
                    </>
                  )
                })()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: '#333', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {diary.content || '내용 없음'}
                </div>
              </div>
              {diary.image && (
                <img src={diary.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate('DiaryEditor', {})} style={{ ...FAB, position: 'fixed', bottom: 80, right: fabRight, zIndex: 20 }}>
        <Plus size={24} color="white" />
      </button>
    </div>
  )
}
