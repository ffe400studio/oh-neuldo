import { Sun, Calendar, LayoutGrid, BookOpen, Settings } from 'lucide-react'

const TABS = [
  { id: 'home', label: '홈', Icon: Sun },
  { id: 'calendar', label: '캘린더', Icon: Calendar },
  { id: 'board', label: '게시판', Icon: LayoutGrid },
  { id: 'diary', label: '일기', Icon: BookOpen },
  { id: 'settings', label: '설정', Icon: Settings },
]

export default function TabBar({ activeTab, setActiveTab }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      margin: '0 auto',
      maxWidth: 390,
      height: 64,
      backgroundColor: '#ffffff',
      boxShadow: '0px -4px 12px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 50,
    }}>
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            <div style={{
              width: 40,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              backgroundColor: active ? '#e8e8e8' : 'transparent',
              transition: 'background 0.2s',
            }}>
              <Icon size={20} color={active ? '#111111' : '#aaaaaa'} strokeWidth={active ? 2.5 : 1.8} />
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: active ? 700 : 400,
              color: active ? '#111111' : '#aaaaaa',
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
