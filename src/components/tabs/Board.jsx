import { CARD } from '../../constants'

export default function Board({ navigate, topics, posts }) {
  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>게시판</div>

      {topics.length === 0 ? (
        <div style={{ ...CARD, padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: '#aaa', fontSize: 15 }}>아직 등록된 내용이 없어요 ✦</p>
          <p style={{ color: '#bbb', fontSize: 13, marginTop: 8 }}>캘린더에서 대주제를 추가해보세요</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topics.map(t => {
            const count = posts.filter(p => p.topicId === t.id).length
            return (
              <div
                key={t.id}
                onClick={() => navigate('PostList', { topicId: t.id })}
                style={{ ...CARD, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: t.colorLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: t.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>
                    {t.startDate} ~ {t.endDate}
                  </div>
                </div>
                <div style={{
                  backgroundColor: '#eee',
                  borderRadius: 20,
                  padding: '4px 10px',
                  fontSize: 12,
                  color: '#555',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>
                  {count}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
