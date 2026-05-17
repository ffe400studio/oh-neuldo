import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('가입 완료! 이메일을 확인해 인증 후 로그인해주세요.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#F5F2F3',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px',
    }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>Oh-neuldo</div>
        <div style={{ fontSize: 14, color: '#aaa', marginTop: 8 }}>오늘도 한 걸음</div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#fff',
        borderRadius: 24,
        boxShadow: '0px 4px 24px rgba(0,0,0,0.10)',
        padding: '28px 24px',
      }}>
        <div style={{ display: 'flex', marginBottom: 24, backgroundColor: '#f5f5f5', borderRadius: 12, padding: 4 }}>
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setMessage('') }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: mode === m ? '#fff' : 'transparent',
                color: mode === m ? '#111' : '#aaa',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {m === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일"
            required
            style={{
              border: '1.5px solid #eee',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
              width: '100%',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            style={{
              border: '1.5px solid #eee',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
              width: '100%',
            }}
          />

          {error && <p style={{ fontSize: 13, color: '#FF6B6B', margin: 0, textAlign: 'center' }}>{error}</p>}
          {message && <p style={{ fontSize: 13, color: '#3DE87A', margin: 0, textAlign: 'center' }}>{message}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '14px 0',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: 4,
            }}
          >
            {loading ? '처리중...' : mode === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
