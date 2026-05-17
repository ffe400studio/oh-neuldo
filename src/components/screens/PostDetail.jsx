import { ChevronLeft, ExternalLink, Pencil, Trash2 } from 'lucide-react'

export default function PostDetail({ navigate, goBack, postId, posts, setPosts }) {
  const post = posts.find(p => p.id === postId)

  if (!post) return (
    <div style={{ padding: 20 }}>
      <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>뒤로</button>
      <p style={{ color: '#aaa' }}>게시글을 찾을 수 없어요.</p>
    </div>
  )

  const handleDelete = () => {
    if (!window.confirm('이 게시글을 삭제할까요?')) return
    setPosts(prev => prev.filter(p => p.id !== postId))
    goBack()
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F2F3' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#F5F2F3' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronLeft size={24} color="#111" />
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('PostEditor', { topicId: post.topicId, postId: post.id })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          >
            <Pencil size={18} color="#555" />
          </button>
          <button
            onClick={handleDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          >
            <Trash2 size={18} color="#FF6B6B" />
          </button>
        </div>
      </div>

      {/* 내용 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 40px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 8px', lineHeight: 1.4 }}>
          {post.title || '제목 없음'}
        </h1>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>
          {post.createdAt?.split('T')[0]}
        </div>

        {post.content && (
          <p style={{ fontSize: 15, color: '#333', lineHeight: 1.8, margin: '0 0 24px', whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
            {post.content}
          </p>
        )}

        {post.links?.length > 0 && (
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#555', marginBottom: 10 }}>링크</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {post.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#eee',
                    borderRadius: 20,
                    padding: '6px 12px',
                    fontSize: 13,
                    color: '#111',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  <ExternalLink size={12} />
                  {link.label || link.url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
