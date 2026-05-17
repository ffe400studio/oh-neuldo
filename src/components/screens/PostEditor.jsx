import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Plus, X } from 'lucide-react'
import { genId } from '../../constants'

export default function PostEditor({ goBack, topicId, postId, posts, setPosts, savePost }) {
  const existing = postId ? posts.find(p => p.id === postId) : null
  const [title, setTitle] = useState(existing?.title || '')
  const [content, setContent] = useState(existing?.content || '')
  const [links, setLinks] = useState(existing?.links || [])
  const [linkUrl, setLinkUrl] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto'
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px'
    }
  }, [content])

  const addLink = () => {
    if (!linkUrl.trim()) return
    setLinks(prev => [...prev, { url: linkUrl.trim(), label: linkLabel.trim() || linkUrl.trim() }])
    setLinkUrl(''); setLinkLabel(''); setShowLinkInput(false)
  }

  const save = async () => {
    if (!title.trim() && !content.trim()) return
    if (existing) {
      const updated = { ...existing, title, content, links }
      setPosts(prev => prev.map(p => p.id === postId ? updated : p))
      await savePost(updated, false)
    } else {
      const newPost = { id: genId(), topicId, title, content, links, createdAt: new Date().toISOString() }
      setPosts(prev => [...prev, newPost])
      await savePost(newPost, true)
    }
    goBack()
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F2F3' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ChevronLeft size={24} color="#111" /></button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{existing ? '수정' : '새 게시글'}</span>
        <button onClick={save} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>저장</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 40px' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" autoFocus
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 20, fontWeight: 700, backgroundColor: 'transparent', color: '#111', marginBottom: 12, boxSizing: 'border-box' }} />
        <textarea ref={contentRef} value={content} onChange={e => setContent(e.target.value)} placeholder="내용을 입력해보세요..." rows={6}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, lineHeight: 1.8, backgroundColor: 'transparent', color: '#333', resize: 'none', boxSizing: 'border-box', overflow: 'hidden' }} />

        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#555', marginBottom: 10 }}>링크</div>
          {links.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {links.map((link, i) => (
                <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#eee', borderRadius: 20, padding: '6px 10px 6px 14px', fontSize: 13, color: '#333' }}>
                  {link.label}
                  <button onClick={() => setLinks(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={14} color="#999" /></button>
                </div>
              ))}
            </div>
          )}
          {showLinkInput ? (
            <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="URL" autoFocus
                style={{ width: '100%', border: 'none', borderBottom: '1px solid #eee', outline: 'none', fontSize: 14, paddingBottom: 8, marginBottom: 10, boxSizing: 'border-box' }} />
              <input value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="표시 텍스트 (선택)" onKeyDown={e => e.key === 'Enter' && addLink()}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setShowLinkInput(false)} style={{ flex: 1, border: '1px solid #eee', borderRadius: 10, padding: '8px 0', background: '#fff', cursor: 'pointer', fontSize: 14 }}>취소</button>
                <button onClick={addLink} style={{ flex: 1, backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 0', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>추가</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowLinkInput(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px dashed #ddd', borderRadius: 12, padding: '10px 14px', background: 'transparent', cursor: 'pointer', color: '#aaa', fontSize: 14 }}>
              <Plus size={14} /> 링크 추가
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
