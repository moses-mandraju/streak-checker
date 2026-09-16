import { Check } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import { cn } from '../utils/cn'

const themes = [
  ['emerald', 'Emerald', '#35D399'], ['ocean', 'Ocean', '#5DD4FF'], ['lavender', 'Lavender', '#B69CFF'],
  ['sunset', 'Sunset', '#FF9D67'], ['forest', 'Forest', '#A8D966'], ['midnight', 'Midnight', '#82AEFF'],
]

export default function ThemeSelector() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{themes.map(([id, name, color]) => <button key={id} onClick={() => setTheme(id)} className={cn('flex min-h-16 items-center gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-px', theme === id ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30')}><span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: color }}>{theme === id && <Check className="h-4 w-4 text-[#071512]" />}</span><span className="text-sm font-semibold">{name}</span></button>)}</div>
}
