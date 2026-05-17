import { ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '../../constants'

export default function DiaryDetail({ navigate, goBack, diaryId, diaries, setDiaries }) {
  const diary = diaries.find(d => d.id === diaryId)

  if (!diary) return (
    <div style={{ padding: 20 }}>
      <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>뒤로</button>
      <p style={{ color: '#aaa' }}>일기를 찾을 수 없어요.</p>
    </div>
  )

  const handleDelete = () => {
    if (!window.confirm('이 일기를 삭제할까요?')) return
    setDiaries(prev => prev.filter(d => d.id !== diaryId))
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
            onClick={() => navigate('DiaryEditor', { diaryId: diary.id })}
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
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>
            {diary.createdAt?.split('T')[0]}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0 }}>
            {formatDate(diary.date)}
          </h1>
        </div>

        {diary.image && (
          <img
            src={diary.image}
            alt=""
            style={{
              width: '100%',
              borderRadius: 16,
              objectFit: 'cover',
              maxHeight: 300,
              marginBottom: 20,
              display: 'block',
            }}
          />
        )}

        <p style={{
          fontSize: 16,
          color: '#333',
          lineHeight: 1.9,
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'keep-all',
        }}>
          {diary.content || '내용 없음'}
        </p>
      </div>
    </div>
  )
}
