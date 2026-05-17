import { useState, useEffect } from 'react'
import TabBar from './components/TabBar'
import Home from './components/tabs/Home'
import Calendar from './components/tabs/Calendar'
import Board from './components/tabs/Board'
import Diary from './components/tabs/Diary'
import ResolutionManager from './components/screens/ResolutionManager'
import TopicDetail from './components/screens/TopicDetail'
import PostList from './components/screens/PostList'
import PostDetail from './components/screens/PostDetail'
import PostEditor from './components/screens/PostEditor'
import DiaryDetail from './components/screens/DiaryDetail'
import DiaryEditor from './components/screens/DiaryEditor'
import TodayPicker from './components/screens/TodayPicker'
import { useLocalStorage } from './hooks/useLocalStorage'
import { todayStr } from './constants'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [screenStack, setScreenStack] = useState([])

  const [resolutions, setResolutions] = useLocalStorage('resolutions', [])
  const [activeResolutionId, setActiveResolutionId] = useLocalStorage('activeResolutionId', null)
  const [topics, setTopics] = useLocalStorage('topics', [])
  const [posts, setPosts] = useLocalStorage('posts', [])
  const [diaries, setDiaries] = useLocalStorage('diaries', [])
  const [todayPicks, setTodayPicks] = useLocalStorage('todayPicks', {})
  const [lastVisitDate, setLastVisitDate] = useLocalStorage('lastVisitDate', '')

  const today = todayStr()

  useEffect(() => {
    if (lastVisitDate !== today) {
      setLastVisitDate(today)
      if (resolutions.length > 0 && !activeResolutionId) {
        setActiveResolutionId(resolutions[Math.floor(Math.random() * resolutions.length)].id)
      }
      setScreenStack([{ name: 'TodayPicker', params: {} }])
    }
  }, [])

  const navigate = (name, params = {}) => {
    setScreenStack(prev => [...prev, { name, params }])
  }

  const goBack = () => {
    setScreenStack(prev => prev.slice(0, -1))
  }

  const currentScreen = screenStack[screenStack.length - 1] || null

  const shared = {
    navigate, goBack,
    resolutions, setResolutions,
    activeResolutionId, setActiveResolutionId,
    topics, setTopics,
    posts, setPosts,
    diaries, setDiaries,
    todayPicks, setTodayPicks,
  }

  const renderScreen = (screen) => {
    const props = { ...shared, ...screen.params }
    switch (screen.name) {
      case 'ResolutionManager': return <ResolutionManager {...props} />
      case 'TopicDetail': return <TopicDetail {...props} />
      case 'PostList': return <PostList {...props} />
      case 'PostDetail': return <PostDetail {...props} />
      case 'PostEditor': return <PostEditor {...props} />
      case 'DiaryDetail': return <DiaryDetail {...props} />
      case 'DiaryEditor': return <DiaryEditor {...props} />
      case 'TodayPicker': return <TodayPicker {...props} />
      default: return null
    }
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <Home {...shared} />
      case 'calendar': return <Calendar {...shared} />
      case 'board': return <Board {...shared} />
      case 'diary': return <Diary {...shared} />
      default: return null
    }
  }

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    margin: '0 auto',
    maxWidth: 390,
    height: '100dvh',
    backgroundColor: '#F5F2F3',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
  }

  return (
    <div style={{ backgroundColor: '#F5F2F3', minHeight: '100dvh' }}>
      <div style={{ maxWidth: 390, margin: '0 auto', position: 'relative', minHeight: '100dvh' }}>
        <div style={{ paddingBottom: 64 }}>
          {renderTab()}
        </div>
        <TabBar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab)
            setScreenStack([])
          }}
        />
        {currentScreen && (
          <div style={overlayStyle}>
            {renderScreen(currentScreen)}
          </div>
        )}
      </div>
    </div>
  )
}
