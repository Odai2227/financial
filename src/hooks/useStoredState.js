import { useEffect, useState } from 'react'

export function useStoredState(key, init, isValid = () => true) {
  const [value, setValue] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(key))
      if (raw && isValid(raw)) return raw
    } catch {
      /* storage unavailable or corrupt: fall back */
    }
    return init()
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [key, value])

  return [value, setValue]
}
