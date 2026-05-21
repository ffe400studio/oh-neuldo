import { useRef } from 'react'
import { LogOut, Camera } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { CARD } from '../../constants'

export default function Settings({ profile, setProfile, saveProfile }) {
  const fileRef = useRef(null)

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const updated = { ...profile, profileImage: reader.result }
      setProfile(updated)
      saveProfile(updated)
    }
    reader.readAsDataURL(file)
  }

  const handleField = (key, value) => {
    const updated = { ...profile, [key]: value }
    setProfile(updated)
  }

  const handleBlur = () => {
    saveProfile(profile)
  }

  const logout = async () => {
    if (!window.confirm('로그아웃 할까요?')) return
    await supabase.auth.signOut()
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>설정</div>

      {/* 프로필 */}
      <div style={{ ...CARD, padding: '24px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: '#aaa', fontWeight: 600, marginBottom: 16 }}>프로필</div>

        {/* 프로필 사진 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#eee',
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {profile.profileImage
              ? <img src={profile.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Camera size={24} color="#bbb" />
            }
            <div style={{
              position: 'absolute', inset: 0,
              backgroundColor: 'rgba(0,0,0,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <Camera size={20} color="#fff" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>
              {profile.username || '이름을 등록해보세요'}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ fontSize: 12, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              사진 변경
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
        </div>

        {/* 이름 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>이름</label>
          <input
            value={profile.username || ''}
            onChange={e => handleField('username', e.target.value)}
            onBlur={handleBlur}
            placeholder="이름을 입력해주세요"
            style={{
              width: '100%',
              border: '1.5px solid #eee',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 인사말 */}
        <div>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>홈 인사말</label>
          <input
            value={profile.greeting || ''}
            onChange={e => handleField('greeting', e.target.value)}
            onBlur={handleBlur}
            placeholder="예) 오늘도 화이팅...!!!"
            style={{
              width: '100%',
              border: '1.5px solid #eee',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {profile.username && (
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 6, paddingLeft: 4 }}>
              미리보기: {profile.username}님 {profile.greeting || '오늘도 화이팅!'}
            </div>
          )}
        </div>
      </div>

      {/* 로그아웃 */}
      <button
        onClick={logout}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: '#fff',
          border: 'none',
          borderRadius: 20,
          boxShadow: '0px 4px 16px rgba(0,0,0,0.10)',
          padding: '16px 0',
          fontSize: 15,
          fontWeight: 600,
          color: '#FF6B6B',
          cursor: 'pointer',
        }}
      >
        <LogOut size={18} />
        로그아웃
      </button>
    </div>
  )
}
