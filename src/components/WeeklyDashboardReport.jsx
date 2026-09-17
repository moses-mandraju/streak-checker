import { format, subDays } from 'date-fns'
import { DATE_KEY } from '../utils/date'
import { Card, CardContent } from './ui/card'

function reportFor(habits, category) {
  const selected = habits.filter((habit) => (habit.category || 'consistency') === category)
  const dates = Array.from({ length: 7 }, (_, index) => format(subDays(new Date(), 6 - index), DATE_KEY))
  let possible = 0
  let completed = 0
  const items = selected.map((habit) => {
    const activeDates = dates.filter((date) => !habit.createdDate || date >= habit.createdDate)
    const count = activeDates.filter((date) => (habit.completionHistory || []).includes(date)).length
    possible += activeDates.length
    completed += count
    return { habit, percent: activeDates.length ? Math.round((count / activeDates.length) * 100) : 0 }
  })
  return { items, percent: possible ? Math.round((completed / possible) * 100) : 0 }
}

function CategoryReport({ icon, title, detail, report, accent }) {
  return <Card className="overflow-hidden"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold">{icon} {title}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><p className="text-3xl font-bold tabular-nums" style={{ color: accent }}>{report.percent}%</p></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full transition-all" style={{ width: `${report.percent}%`, backgroundColor: accent }} /></div><div className="mt-5 space-y-3">{report.items.length ? report.items.map(({ habit, percent }) => <div className="flex items-center justify-between gap-3" key={habit.id}><span className="min-w-0 truncate text-sm">{habit.emoji} {habit.title}</span><span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color: accent }}>{percent}%</span></div>) : <p className="text-sm text-muted-foreground">No {title.toLowerCase()} habits yet.</p>}</div></CardContent></Card>
}

export default function WeeklyDashboardReport({ habits, user }) {
  const consistency = reportFor(habits, 'consistency')
  const resistance = reportFor(habits, 'resistance')
  return <><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Weekly report</p><h1 className="mt-2 text-2xl font-semibold">Your week, {user?.displayName?.split(' ')[0] || 'there'}</h1><p className="mt-2 text-sm text-muted-foreground">A clear view of the last seven days.</p></div><div className="grid gap-4 lg:grid-cols-2"><CategoryReport icon="🌱" title="Overall Consistency" detail="Positive habits completed this week" report={consistency} accent="#7EE2B0" /><CategoryReport icon="🛑" title="Overall Resistance" detail="Unwanted habits successfully resisted" report={resistance} accent="#FB8A72" /></div></>
}
