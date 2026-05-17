import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const v = typeof value === 'function' ? value(storedValue) : value
      setStoredValue(v)
      window.localStorage.setItem(key, JSON.stringify(v))
    } catch (e) {
      console.error(e)
    }
  }

  return [storedValue, setValue]
}
