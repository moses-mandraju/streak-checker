import { format, getDay, getDaysInMonth, startOfMonth } from 'date-fns'
import { DATE_KEY } from '../utils/date'
import { cn } from '../utils/cn'

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function InteractiveHabitMonth({ habit, accent, onToggleDate, updatingDate }) {
  const today = new Date()
  const start = startOfMonth(today)
  const leading = (getDay(start) + 6) % 7
  const history = habit.completionHistory || []
  const cells = [...Array(leading), ...Array.from({ length: getDaysInMonth(today) }, (_, index) => index + 1)]
  return <section className="mt-5"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">{format(today, 'MMMM yyyy')}</p><span className="text-xs text-muted-foreground">Tap a day to edit</span></div><div className="grid grid-cols-7 gap-1 text-center">{weekdays.map((day, index) => <span className="pb-1 text-[10px] font-semibold text-muted-foreground" key={`${day}-${index}`}>{day}</span>)}{cells.map((number, index) => { if (!number) return <span key={`blank-${index}`} />; const date = new Date(today.getFullYear(), today.getMonth(), number); const key = format(date, DATE_KEY); const complete = history.includes(key); const isToday = key === format(today, DATE_KEY); const future = date > today; return <button type="button" key={key} disabled={future || Boolean(updatingDate)} onClick={() => onToggleDate(key)} aria-label={`${format(date, 'MMMM d')}: ${complete ? 'completed, toggle incomplete' : 'not completed, toggle complete'}`} className={cn('mx-auto flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-semibold transition-transform enabled:hover:scale-110 disabled:cursor-not-allowed', future && 'text-muted-foreground/35', !complete && !future && 'bg-muted/70 text-muted-foreground', isToday && !complete && 'ring-1 ring-primary ring-offset-1 ring-offset-card')} style={complete ? { backgroundColor: accent, color: '#061512' } : undefined}>{complete ? '✓' : number}</button> })}</div></section>
}
