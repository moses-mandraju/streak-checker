import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'

export function useTheme() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.add('dark')
    root.dataset.theme = theme
  }, [theme])

  return theme
}
