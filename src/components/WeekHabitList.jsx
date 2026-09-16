import { format, subDays } from 'date-fns'
import { DATE_KEY } from '../utils/date'

export default function WeekHabitList({ habits }) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, index) => subDays(today, 6 - index))
  return <div className="space-y-3">{habits.map((habit, index) => <div key={habit.id} className="rounded-2xl border border-border bg-card p-4"><div className="mb-3 flex items-center justify-between"><p className="font-semibold">{habit.emoji} {habit.title}</p><span className="text-xs text-muted-foreground">{habit.currentStreak || 0} day streak</span></div><div className="grid grid-cols-7 gap-2">{days.map((day) => { const key = format(day, DATE_KEY); const complete = (habit.completionHistory || []).includes(key); return <div className="text-center" key={key}><p className="mb-1 text-[10px] font-semibold text-muted-foreground">{format(day, 'EEEEE')}</p><span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs ${complete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{complete ? '✓' : format(day, 'd')}</span></div> })}</div></div>)}</div>
}
