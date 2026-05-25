export const COLOR_PALETTES = [
  { dark: '#FF6EB4', light: '#FFD6EC' },
  { dark: '#C8E600', light: '#EEFFA0' },
  { dark: '#5B9EFF', light: '#C2DAFF' },
  { dark: '#3DE87A', light: '#B8FAD0' },
  { dark: '#7B6EFF', light: '#D4D0FF' },
  { dark: '#FF6B6B', light: '#FFCECE' },
  { dark: '#A855F7', light: '#E9D5FF' },
  { dark: '#00D4E8', light: '#B8F5FF' },
]

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function toDateStr(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayStr() {
  return toDateStr(new Date())
}

export function formatDate(ds) {
  if (!ds) return ''
  const [y, m, d] = ds.split('-')
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`
}

export const HOLIDAYS = {
  '2025-01-01': '신정',
  '2025-01-28': '설날 연휴',
  '2025-01-29': '설날',
  '2025-01-30': '설날 연휴',
  '2025-03-01': '삼일절',
  '2025-05-05': '어린이날',
  '2025-05-06': '대체공휴일',
  '2025-06-06': '현충일',
  '2025-08-15': '광복절',
  '2025-10-05': '추석 연휴',
  '2025-10-06': '추석',
  '2025-10-07': '추석 연휴',
  '2025-10-08': '대체공휴일',
  '2025-10-09': '한글날',
  '2025-12-25': '성탄절',
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴',
  '2026-02-17': '설날',
  '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절',
  '2026-05-05': '어린이날',
  '2026-06-06': '현충일',
  '2026-08-15': '광복절',
  '2026-09-23': '추석 연휴',
  '2026-09-24': '추석',
  '2026-09-25': '추석 연휴',
  '2026-10-03': '개천절',
  '2026-10-09': '한글날',
  '2026-12-25': '성탄절',
}

export const CARD = {
  backgroundColor: '#ffffff',
  borderRadius: 20,
  boxShadow: '0px 4px 16px rgba(0,0,0,0.10)',
}

export const FAB = {
  width: 52,
  height: 52,
  borderRadius: '50%',
  backgroundColor: '#111111',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0px 4px 14px rgba(0,0,0,0.28)',
  cursor: 'pointer',
  flexShrink: 0,
}
