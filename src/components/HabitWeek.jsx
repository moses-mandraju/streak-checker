import { format, subDays } from 'date-fns'
import { cn } from '../utils/cn'
import { DATE_KEY } from '../utils/date'

const accents = ['#35D399', '#60A5FA', '#A78BFA', '#FBBF24', '#FB7185', '#22D3EE']

function habitAccent(habit) {
  if (habit.color) return habit.color
  return accents[(habit.title || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % accents.length]
}

export default function HabitWeek({ habit }) {
  const today = new Date()
  const history = habit.completionHistory || []
  const days = Array.from({ length: 7 }, (_, index) => subDays(today, 6 - index))
  const accent = habitAccent(habit)

  return <div className="mt-5" aria-label={`Recent week for ${habit.title}`}><div className="grid grid-cols-7 gap-1.5 text-center">
    {days.map((day) => <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground" key={`label-${day}`}>{format(day, 'EEEEE')}</span>)}
    {days.map((day) => {
      const key = format(day, DATE_KEY)
      const complete = history.includes(key)
      const isToday = key === format(today, DATE_KEY)
      return <span key={key} className={cn('mx-auto flex h-6 w-6 items-center justify-center rounded-full border text-[10px]', complete ? 'border-transparent text-[#071A16]' : isToday ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground')} style={complete ? { backgroundColor: accent } : undefined}>{complete ? '✓' : isToday ? format(day, 'd') : '·'}</span>
    })}
  </div></div>
}
