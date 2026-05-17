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
