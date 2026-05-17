import { useState, useRef } from 'react'
import { ChevronLeft, Plus, X } from 'lucide-react'
import { genId, FAB } from '../../constants'

export default function ResolutionManager({
  goBack, resolutions, setResolutions, saveResolution, deleteResolution,
  activeResolutionId, setActiveResolutionId,
}) {
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [text, setText] = useState('')

  const openAdd = () => { setText(''); setEditId(null); setShowModal(true) }
  const openEdit = (r) => { setText(r.text); setEditId(r.id); setShowModal(true) }

  const save = async () => {
    if (!text.trim()) return
    if (editId) {
      const updated = resolutions.map(r => r.id === editId ? { ...r, text: text.trim() } : r)
      setResolutions(updated)
      await saveResolution({ id: editId, text: text.trim() }, false)
    } else {
      const newR = { id: genId(), text: text.trim(), createdAt: new Date().toISOString() }
      setResolutions(prev => [...prev, newR])
      await saveResolution(newR, true)
      if (!activeResolutionId) setActiveResolutionId(newR.id)
    }
    setShowModal(false)
  }

  const longTimers = useRef({})
  const startLongPress = (id) => {
    longTimers.current[id] = setTimeout(async () => {
      if (window.confirm('이 결심을 삭제할까요?')) {
        setResolutions(prev => prev.filter(r => r.id !== id))
        await deleteResolution(id)
        if (activeResolutionId === id) setActiveResolutionId(null)
      }
    }, 600)
  }
  const cancelLongPress = (id) => clearTimeout(longTimers.current[id])

  const activeResolution = resolutions.find(r => r.id === activeResolutionId) || resolutions[0]

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#F5F2F3' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronLeft size={24} color="#111" />
        </button>
        <span style={{ fontWeight: 700, fontSize: 18 }}>결심 관리</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 100px' }}>
        {resolutions.length === 0 ? (
          <div style={{ backgroundColor: '#fff', borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: '40px 20px', textAlign: 'center', marginTop: 8 }}>
            <p style={{ color: '#aaa', fontSize: 15 }}>아직 등록된 내용이 없어요 ✦</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {resolutions.map(r => {
              const isActive = r.id === activeResolution?.id
              return (
                <div
                  key={r.id}
                  onClick={() => { setActiveResolutionId(r.id); openEdit(r) }}
                  onMouseDown={() => startLongPress(r.id)}
                  onMouseUp={() => cancelLongPress(r.id)}
                  onMouseLeave={() => cancelLongPress(r.id)}
                  onTouchStart={() => startLongPress(r.id)}
                  onTouchEnd={() => cancelLongPress(r.id)}
                  onTouchCancel={() => cancelLongPress(r.id)}
                  style={{
                    backgroundColor: isActive ? '#111' : '#fff',
                    borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    padding: '16px 18px', cursor: 'pointer', userSelect: 'none', position: 'relative',
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: 12, right: 14,
                      backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
                      padding: '2px 8px', fontSize: 11, color: '#fff', fontWeight: 600,
                    }}>표시중</div>
                  )}
                  <p style={{
                    margin: 0, fontSize: 15, lineHeight: 1.6,
                    color: isActive ? '#fff' : '#111',
                    paddingRight: isActive ? 56 : 0, wordBreak: 'keep-all',
                  }}>{r.text}</p>
                </div>
              )
            })}
          </div>
        )}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 20 }}>길게 누르면 삭제돼요</p>
      </div>

      <button onClick={openAdd} style={{ ...FAB, position: 'absolute', bottom: 24, right: 16 }}>
        <Plus size={24} color="white" />
      </button>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 390, margin: '0 auto', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{editId ? '결심 수정' : '새 결심 추가'}</span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <textarea
              value={text} onChange={e => setText(e.target.value)}
              placeholder="결심을 입력해보세요..." autoFocus rows={4}
              style={{ width: '100%', border: '1.5px solid #eee', borderRadius: 14, padding: '12px 14px', fontSize: 15, lineHeight: 1.6, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            <button
              onClick={save}
              style={{ marginTop: 12, width: '100%', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
            >저장하기</button>
          </div>
        </div>
      )}
    </div>
  )
}
