import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { CARD, todayStr } from '../../constants'

export default function Board({ navigate, topics, posts }) {
  const [showPast, setShowPast] = useState(false)
  const [query, setQuery] = useState('')
  const today = todayStr()

  const activeTopics = topics.filter(t => t.scheduleType === 'always' || !t.endDate || t.endDate >= today)
  const pastTopics = topics.filter(t => t.scheduleType === 'fixed' && t.endDate && t.endDate < today)

  const q = query.trim()
  const filteredActive = q ? activeTopics.filter(t => t.title.includes(q)) : activeTopics
  const filteredPast = q ? pastTopics.filter(t => t.title.includes(q)) : pastTopics

  const renderTopicCard = (t, faded = false) => {
    const count = posts.filter(p => p.topicId === t.id).length
    return (
      <div
        key={t.id}
        onClick={() => navigate('PostList', { topicId: t.id })}
        style={{ ...CARD, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', opacity: faded ? 0.6 : 1 }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: t.colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: t.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.title}
          </div>
          <div style={{ fontSize: 12, color: '#aaa' }}>
            {t.scheduleType === 'always' ? '상시' : `${t.startDate} ~ ${t.endDate}`}
          </div>
        </div>
        <div style={{ backgroundColor: '#eee', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#555', fontWeight: 600, flexShrink: 0 }}>
          {count}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 14 }}>게시판</div>

      {/* 검색 */}
      {topics.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, padding: '10px 14px', marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Search size={16} color="#bbb" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="대주제 검색..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#111', backgroundColor: 'transparent' }}
          />
        </div>
      )}

      {topics.length === 0 ? (
        <div style={{ ...CARD, padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: '#aaa', fontSize: 15 }}>아직 등록된 내용이 없어요 ✦</p>
          <p style={{ color: '#bbb', fontSize: 13, marginTop: 8 }}>캘린더에서 대주제를 추가해보세요</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredActive.length === 0 && filteredPast.length === 0 && (
            <p style={{ textAlign: 'center', color: '#bbb', fontSize: 14, padding: '24px 0' }}>검색 결과가 없어요</p>
          )}
          {filteredActive.map(t => renderTopicCard(t, false))}

          {filteredPast.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <button
                onClick={() => setShowPast(p => !p)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 2px', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <span style={{ fontSize: 12, color: '#bbb' }}>지난 주제 ({filteredPast.length})</span>
                <ChevronDown size={13} color="#bbb" style={{ transform: showPast ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>
              {showPast && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredPast.map(t => renderTopicCard(t, true))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
