import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/screens/Auth'
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
import { todayStr } from './constants'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [activeTab, setActiveTab] = useState('home')
  const [screenStack, setScreenStack] = useState([])
  const [syncing, setSyncing] = useState(false)

  const [resolutions, setResolutionsState] = useState([])
  const [activeResolutionId, setActiveResolutionIdState] = useState(null)
  const [topics, setTopicsState] = useState([])
  const [posts, setPostsState] = useState([])
  const [diaries, setDiariesState] = useState([])
  const [todayPicks, setTodayPicksState] = useState({})
  const [lastVisitDate, setLastVisitDateState] = useState('')

  // Auth 상태 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // 로그인 후 데이터 로드
  useEffect(() => {
    if (!session) return
    loadAllData()
  }, [session])

  const loadAllData = async () => {
    setSyncing(true)
    const uid = session.user.id

    const [
      { data: res },
      { data: top },
      { data: pos },
      { data: dia },
      { data: settings },
    ] = await Promise.all([
      supabase.from('resolutions').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('topics').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('posts').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('diaries').select('*').eq('user_id', uid).order('created_at'),
      supabase.from('user_settings').select('*').eq('user_id', uid).single(),
    ])

    if (res) setResolutionsState(res)
    if (top) setTopicsState(top.map(t => ({
      ...t,
      colorLight: t.color_light,
      startDate: t.start_date,
      endDate: t.end_date,
    })))
    if (pos) setPostsState(pos.map(p => ({
      ...p,
      topicId: p.topic_id,
      createdAt: p.created_at,
    })))
    if (dia) setDiariesState(dia.map(d => ({
      ...d,
      createdAt: d.created_at,
    })))

    if (settings) {
      setActiveResolutionIdState(settings.active_resolution_id)
      setTodayPicksState(settings.today_picks || {})
      setLastVisitDateState(settings.last_visit_date || '')
    }

    setSyncing(false)

    // 날짜 바뀌면 TodayPicker
    const today = todayStr()
    const lv = settings?.last_visit_date || ''
    if (lv !== today) {
      await upsertSettings({ last_visit_date: today })
      setLastVisitDateState(today)
      setScreenStack([{ name: 'TodayPicker', params: {} }])
    }
  }

  const upsertSettings = async (patch) => {
    const uid = session.user.id
    await supabase.from('user_settings').upsert({ user_id: uid, ...patch }, { onConflict: 'user_id' })
  }

  // --- 데이터 setter (DB + state 동시 업데이트) ---

  const setResolutions = async (updater) => {
    // 여기서는 state만 업데이트, 개별 save 함수에서 DB 처리
    setResolutionsState(updater)
  }

  const setActiveResolutionId = async (id) => {
    setActiveResolutionIdState(id)
    await upsertSettings({ active_resolution_id: id })
  }

  const setTopics = (updater) => setTopicsState(updater)
  const setPosts = (updater) => setPostsState(updater)
  const setDiaries = (updater) => setDiariesState(updater)

  const setTodayPicks = async (updater) => {
    const next = typeof updater === 'function' ? updater(todayPicks) : updater
    setTodayPicksState(next)
    await upsertSettings({ today_picks: next })
  }

  const navigate = (name, params = {}) => setScreenStack(prev => [...prev, { name, params }])
  const goBack = () => setScreenStack(prev => prev.slice(0, -1))
  const currentScreen = screenStack[screenStack.length - 1] || null

  // --- DB 동기화 헬퍼 ---
  const uid = () => session?.user?.id

  const saveResolution = async (r, isNew) => {
    if (isNew) {
      await supabase.from('resolutions').insert({ id: r.id, user_id: uid(), text: r.text, created_at: r.createdAt })
    } else {
      await supabase.from('resolutions').update({ text: r.text }).eq('id', r.id)
    }
  }

  const deleteResolution = async (id) => {
    await supabase.from('resolutions').delete().eq('id', id)
  }

  const saveTopic = async (t, isNew) => {
    const row = {
      id: t.id, user_id: uid(), title: t.title, color: t.color,
      color_light: t.colorLight, start_date: t.startDate, end_date: t.endDate, subtasks: t.subtasks,
    }
    if (isNew) await supabase.from('topics').insert(row)
    else await supabase.from('topics').update(row).eq('id', t.id)
  }

  const deleteTopic = async (id) => {
    await supabase.from('topics').delete().eq('id', id)
    await supabase.from('posts').delete().eq('topic_id', id)
  }

  const savePost = async (p, isNew) => {
    const row = {
      id: p.id, user_id: uid(), topic_id: p.topicId,
      title: p.title, content: p.content, links: p.links, created_at: p.createdAt,
    }
    if (isNew) await supabase.from('posts').insert(row)
    else await supabase.from('posts').update(row).eq('id', p.id)
  }

  const deletePost = async (id) => {
    await supabase.from('posts').delete().eq('id', id)
  }

  const saveDiary = async (d, isNew) => {
    const row = {
      id: d.id, user_id: uid(), date: d.date,
      content: d.content, image: d.image, created_at: d.createdAt,
    }
    if (isNew) await supabase.from('diaries').insert(row)
    else await supabase.from('diaries').update(row).eq('id', d.id)
  }

  const deleteDiary = async (id) => {
    await supabase.from('diaries').delete().eq('id', id)
  }

  const shared = {
    navigate, goBack,
    resolutions, setResolutions, saveResolution, deleteResolution,
    activeResolutionId, setActiveResolutionId,
    topics, setTopics, saveTopic, deleteTopic,
    posts, setPosts, savePost, deletePost,
    diaries, setDiaries, saveDiary, deleteDiary,
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

  // 로딩중
  if (session === undefined) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: '#F5F2F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#ddd' }}>Oh-neuldo</div>
      </div>
    )
  }

  // 비로그인
  if (!session) return <Auth />

  return (
    <div style={{ backgroundColor: '#F5F2F3', minHeight: '100dvh' }}>
      {syncing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, backgroundColor: '#111', zIndex: 999, animation: 'none', opacity: 0.3 }} />
      )}
      <div style={{ maxWidth: 390, margin: '0 auto', position: 'relative', minHeight: '100dvh' }}>
        <div style={{ paddingBottom: 64 }}>
          {renderTab()}
        </div>
        <TabBar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setScreenStack([]) }} />
        {currentScreen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, margin: '0 auto',
            maxWidth: 390, height: '100dvh', backgroundColor: '#F5F2F3', zIndex: 100,
            display: 'flex', flexDirection: 'column',
          }}>
            {renderScreen(currentScreen)}
          </div>
        )}
      </div>
    </div>
  )
}
