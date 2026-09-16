import { Sprout } from 'lucide-react'

export default function HabitlyLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sprout className="h-5 w-5" />
      </div>
      {!compact && <div><p className="font-semibold tracking-tight">Habitly</p><p className="text-[11px] text-muted-foreground">Build consistency</p></div>}
    </div>
  )
}
