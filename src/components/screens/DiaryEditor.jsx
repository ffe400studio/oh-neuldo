import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ImagePlus, X } from 'lucide-react'
import { genId, todayStr } from '../../constants'

export default function DiaryEditor({ goBack, diaryId, diaries, setDiaries, saveDiary }) {
  const existing = diaryId ? diaries.find(d => d.id === diaryId) : null
  const [date, setDate] = useState(existing?.date || todayStr())
  const [content, setContent] = useState(existing?.content || '')
  const [image, setImage] = useState(existing?.image || null)
  const contentRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto'
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px'
    }
  }, [content])

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  const save = async () => {
    if (!content.trim() && !image) return
    if (existing) {
      const updated = { ...existing, date, content, image }
      setDiaries(prev => prev.map(d => d.id === diaryId ? updated : d))
      await saveDiary(updated, false)
    } else {
      const newDiary = { id: genId(), date, content, image, createdAt: new Date().toISOString() }
      setDiaries(prev => [...prev, newDiary])
      await saveDiary(newDiary, true)
    }
    goBack()
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F2F3' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ChevronLeft size={24} color="#111" /></button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{existing ? '일기 수정' : '새 일기'}</span>
        <button onClick={save} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>저장</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>날짜</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 22, fontWeight: 700, color: '#111', backgroundColor: 'transparent', cursor: 'pointer' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          {image ? (
            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <img src={image} alt="" style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 240, display: 'block' }} />
              <button onClick={() => setImage(null)} style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} color="#fff" />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px dashed #ddd', borderRadius: 14, padding: '12px 16px', background: 'transparent', cursor: 'pointer', color: '#aaa', fontSize: 14, width: '100%' }}>
              <ImagePlus size={18} /> 사진 추가
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
        </div>
        <textarea ref={contentRef} value={content} onChange={e => setContent(e.target.value)} placeholder="오늘 하루를 기록해보세요..." autoFocus rows={8}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: 16, lineHeight: 1.9, backgroundColor: 'transparent', color: '#333', resize: 'none', boxSizing: 'border-box', overflow: 'hidden' }} />
      </div>
    </div>
  )
}
