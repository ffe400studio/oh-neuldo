import { ChevronLeft, Plus, Link } from 'lucide-react'
import { CARD, FAB } from '../../constants'

export default function PostList({ navigate, goBack, topicId, topics, posts }) {
  const topic = topics.find(t => t.id === topicId)
  const topicPosts = [...posts.filter(p => p.topicId === topicId)].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  if (!topic) return (
    <div style={{ padding: 20 }}>
      <button onClick={goBack}>뒤로</button>
      <p>대주제를 찾을 수 없어요.</p>
    </div>
  )

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#F5F2F3' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', backgroundColor: '#F5F2F3' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronLeft size={24} color="#111" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: topic.color, flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 18 }}>{topic.title}</span>
        </div>
      </div>

      {/* 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 100px' }}>
        {topicPosts.length === 0 ? (
          <div style={{ ...CARD, padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: '#aaa', fontSize: 15 }}>아직 등록된 내용이 없어요 ✦</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topicPosts.map(post => (
              <div
                key={post.id}
                onClick={() => navigate('PostDetail', { postId: post.id })}
                style={{ ...CARD, padding: '16px 18px', cursor: 'pointer' }}
              >
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#111' }}>
                  {post.title || '제목 없음'}
                </div>
                {post.content && (
                  <div style={{
                    fontSize: 13,
                    color: '#666',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: 10,
                  }}>
                    {post.content}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#aaa' }}>
                    {post.createdAt?.split('T')[0]}
                  </span>
                  {post.links?.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: '#eee',
                      borderRadius: 20,
                      padding: '3px 8px',
                      fontSize: 11,
                      color: '#555',
                    }}>
                      <Link size={10} />
                      {post.links.length}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('PostEditor', { topicId })}
        style={{ ...FAB, position: 'absolute', bottom: 24, right: 16 }}
      >
        <Plus size={24} color="white" />
      </button>
    </div>
  )
}
