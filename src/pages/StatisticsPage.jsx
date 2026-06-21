import { BarChart3 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { Card, CardContent } from '../components/ui/card'
import { useHabitStore } from '../store/habitStore'
import { getCompletionStats } from '../utils/date'
import { cn } from '../utils/cn'

const widthClasses = [
  'w-0',
  'w-1/12',
  'w-2/12',
  'w-3/12',
  'w-4/12',
  'w-5/12',
  'w-6/12',
  'w-7/12',
  'w-8/12',
  'w-9/12',
  'w-10/12',
  'w-11/12',
  'w-full',
]

function completionWidthClass(percentage) {
  return widthClasses[Math.round((percentage / 100) * 12)]
}

export default function StatisticsPage() {
  const habits = useHabitStore((state) => state.habits)

  return (
    <>
      <PageHeader
        eyebrow="Statistics"
        title="Habit performance"
        description="Current streaks, longest streaks, completed days, and completion percentages."
      />
      {habits.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {habits.map((habit) => {
            const stats = getCompletionStats(habit)

            return (
              <Card key={habit.id} className="hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-2xl">
                      {habit.emoji}
                    </div>
                    <div>
                      <h2 className="font-semibold">{habit.title}</h2>
                      <p className="text-sm text-muted-foreground">Progress overview</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Metric label="Current streak" value={habit.currentStreak || 0} />
                    <Metric label="Longest streak" value={habit.longestStreak || 0} />
                    <Metric label="Completed days" value={stats.totalCompletedDays} />
                    <Metric label="Completion" value={`${stats.completionPercentage}%`} />
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      aria-label={`${stats.completionPercentage}% complete`}
                      className={cn(
                        'h-full rounded-full bg-primary transition-all duration-500',
                        completionWidthClass(stats.completionPercentage),
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <BarChart3 className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}
