import { useEffect } from 'react'
import { useThemeStore } from '../store/themeStore'

export function useTheme() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function applyTheme() {
      const shouldUseDark = theme === 'dark' || (theme === 'system' && media.matches)
      root.classList.toggle('dark', shouldUseDark)
    }

    applyTheme()
    media.addEventListener('change', applyTheme)

    return () => media.removeEventListener('change', applyTheme)
  }, [theme])

  return theme
}
