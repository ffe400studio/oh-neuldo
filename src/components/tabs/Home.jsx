import { useMemo, useState, useEffect, useRef } from 'react'
import { ChevronRight, Camera, Plus, X, Pencil } from 'lucide-react'
import { todayStr, formatDate, CARD } from '../../constants'
import { supabase } from '../../lib/supabase'

export default function Home({
  navigate,
  resolutions, activeResolutionId,
  topics, setTopics,
  todayPicks,
  profile,
  appSettings,
  photos, savePhotos,
}) {
  const today = todayStr()
  const showPhoto = appSettings?.showPhoto !== false
  const showResolution = appSettings?.showResolution !== false

  // ── 사진 슬라이드쇼 ───────────────────────────────────────
  const [photoIdx, setPhotoIdx] = useState(0)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const photoFileRef = useRef(null)
  const touchStartX = useRef(null)

  useEffect(() => {
    if ((photos || []).length <= 1) return
    const t = setInterval(() => setPhotoIdx(i => (i + 1) % photos.length), 4000)
    return () => clearInterval(t)
  }, [(photos || []).length])

  useEffect(() => {
    if (photoIdx >= (photos || []).length && (photos || []).length > 0) setPhotoIdx(photos.length - 1)
  }, [(photos || []).length])

  const handlePhotoTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handlePhotoTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 50) {
      if (diff < 0) setPhotoIdx(i => (i + 1) % photos.length)
      else setPhotoIdx(i => (i - 1 + photos.length) % photos.length)
    }
    touchStartX.current = null
  }

  const addPhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onloadend = async () => {
      const img = new Image()
      img.onload = async () => {
        const MAX = 1200
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(async (blob) => {
          setUploading(true)
          const uid = (await supabase.auth.getUser()).data.user.id
          const filename = `${uid}/${Date.now()}.jpg`
          const { error } = await supabase.storage.from('photos').upload(filename, blob, { contentType: 'image/jpeg' })
          if (!error) {
            const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filename)
            await savePhotos([...(photos || []), publicUrl].slice(0, 4))
          }
          setUploading(false)
        }, 'image/jpeg', 0.8)
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = async (idx) => {
    const url = photos[idx]
    const path = url.split('/photos/')[1]
    if (path) await supabase.storage.from('photos').remove([path])
    await savePhotos(photos.filter((_, i) => i !== idx))
  }

  // ── 오늘의 할일 ──────────────────────────────────────────
  const activeResolution = useMemo(() => {
    if (!resolutions.length) return null
    return resolutions.find(r => r.id === activeResolutionId) || resolutions[0]
  }, [resolutions, activeResolutionId])

  const pickedIds = todayPicks[today] || []

  const todayTopics = useMemo(() => {
    return topics
      .filter(t => {
        if (t.scheduleType === 'always') return true
        return t.startDate <= today && t.endDate >= today
      })
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
      {/* 상단 헤더 */}
      <div style={{ padding: '20px 4px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {profile?.profileImage ? (
            <img src={profile.profileImage} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#e8e8e8', flexShrink: 0 }} />
          )}
          <div>
            {profile?.username ? (
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
                {profile.username}님 {profile.greeting || '오늘도 화이팅!'}
              </div>
            ) : (
              <span style={{ fontSize: 13, fontWeight: 700, color: '#aaa', letterSpacing: '0.08em' }}>Oh-neuldo</span>
            )}
          </div>
        </div>
        <span style={{ fontSize: 12, color: '#aaa' }}>{formatDate(today)}</span>
      </div>

      {/* 사진 슬라이드쇼 */}
      {showPhoto && (
        <div
          onTouchStart={photos.length > 1 ? handlePhotoTouchStart : undefined}
          onTouchEnd={photos.length > 1 ? handlePhotoTouchEnd : undefined}
          style={{
            position: 'relative',
            width: '100%',
            height: 210,
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: 14,
            backgroundColor: '#eee',
            boxShadow: '0px 4px 16px rgba(0,0,0,0.10)',
            flexShrink: 0,
          }}
        >
          {(photos || []).length > 0 ? (
            <img
              src={(photos || [])[photoIdx] || photos[0]}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Camera size={32} color="#bbb" />
              <span style={{ fontSize: 13, color: '#bbb' }}>사진을 등록해보세요</span>
            </div>
          )}

          {/* dot indicator */}
          {(photos || []).length > 1 && (
            <div style={{ position: 'absolute', bottom: 36, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
              {photos.map((_, i) => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'background 0.2s' }} />
              ))}
            </div>
          )}

          {/* 편집 버튼 */}
          <button
            onClick={() => setShowPhotoModal(true)}
            style={{
              position: 'absolute', bottom: 10, right: 10,
              background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%',
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Pencil size={13} color="#fff" />
          </button>
        </div>
      )}

      {/* 결심 배너 */}
      {showResolution && (
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
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 10, fontWeight: 500 }}>오늘의 결심</div>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 600, lineHeight: 1.55, minHeight: 52, wordBreak: 'keep-all' }}>
            {activeResolution ? activeResolution.text : '아직 결심이 없어요. 추가해보세요 ✦'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {resolutions.slice(0, 8).map(r => (
                <div key={r.id} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: r.id === (activeResolution?.id) ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'background 0.2s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              결심 관리 <ChevronRight size={14} />
            </div>
          </div>
        </div>
      )}

      {/* 오늘의 할일 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>오늘의 할일</span>
        {totalCount > 0 && (
          <span style={{ fontSize: 12, color: '#aaa' }}>{totalCount}개 중 {doneCount}개 완료</span>
        )}
      </div>

      {pickedIds.length === 0 ? (
        <div style={{ ...CARD, padding: '36px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <p style={{ color: '#aaa', fontSize: 15 }}>오늘 할일을 골라보세요</p>
          <button onClick={() => navigate('TodayPicker')} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
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
                      <input type="checkbox" checked={s.isDone} onChange={() => toggleSubtask(topic.id, s.id)}
                        style={{ accentColor: '#111', width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }} />
                      <span style={{ fontSize: 15, color: s.isDone ? '#aaa' : '#111', textDecoration: s.isDone ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                        {s.title}
                      </span>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ height: 4, backgroundColor: '#eee', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: topic.color, borderRadius: 2, transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#aaa' }}>{done} / {subtasks.length}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pickedIds.length > 0 && (
        <button onClick={() => navigate('TodayPicker')} style={{ marginTop: 12, width: '100%', border: '1.5px dashed #ddd', borderRadius: 14, padding: '12px 0', fontSize: 13, color: '#aaa', backgroundColor: 'transparent', cursor: 'pointer' }}>
          할일 다시 선택하기
        </button>
      )}

      {/* 사진 관리 모달 */}
      {showPhotoModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: 390, margin: '0 auto', backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', maxHeight: '80dvh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>사진 관리</span>
              <button onClick={() => setShowPhotoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {(photos || []).map((src, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={() => removePhoto(i)}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  ><X size={12} color="#fff" /></button>
                </div>
              ))}
              {(photos || []).length < 4 && (
                <button
                  onClick={() => !uploading && photoFileRef.current?.click()}
                  style={{ aspectRatio: '1', borderRadius: 12, border: '1.5px dashed #ddd', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'default' : 'pointer' }}
                >
                  {uploading ? <div style={{ fontSize: 11, color: '#bbb' }}>업로드중...</div> : <Plus size={24} color="#bbb" />}
                </button>
              )}
            </div>
            <input ref={photoFileRef} type="file" accept="image/*" onChange={addPhoto} style={{ display: 'none' }} />
            <p style={{ fontSize: 12, color: '#bbb', textAlign: 'center', marginTop: 16 }}>최대 4장 등록 가능</p>
          </div>
        </div>
      )}
    </div>
  )
}
