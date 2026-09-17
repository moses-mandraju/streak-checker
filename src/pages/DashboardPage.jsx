import {
  CheckCircle2,
  Flame,
  Trophy,
} from 'lucide-react'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import HabitCard from '../components/HabitCard'
import { Card, CardContent } from '../components/ui/card'

import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'

import { todayKey } from '../utils/date'
import WeeklyDashboardReport from '../components/WeeklyDashboardReport'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const habits = useHabitStore((state) => state.habits)
  const loading = useHabitStore((state) => state.loading)

  const completedToday = habits.filter((habit) =>
    (habit.completionHistory || []).includes(todayKey()),
  )

  const remainingHabits = habits.filter(
    (habit) => !(habit.completionHistory || []).includes(todayKey()),
  )

  const longestStreak = habits.reduce(
    (max, habit) => Math.max(max, habit.longestStreak || 0),
    0,
  )

  const completion =
    habits.length === 0
      ? 0
      : Math.round((completedToday.length / habits.length) * 100)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  if (!loading && habits.length > 0) {
    return <WeeklyDashboardReport habits={habits} user={user} />
  }

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Good ${greeting}, ${user?.displayName?.split(' ')[0] || 'there'} 👋`}
        description="Build consistency, one day at a time."
      />

      {habits.length === 0 ? (
        <Card className="mb-8 border-primary/20">
          <CardContent className="py-16 text-center">
            <div className="text-6xl">🌱</div>
            <h2 className="mt-6 text-3xl font-semibold">
              Welcome to Habitly
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Create your first habit and start building consistency one day at a time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Today's progress bar */}
          <Card className="mb-6 overflow-hidden border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Today</p>
                  <h2 className="mt-1 text-xl font-semibold">Your daily rhythm</h2>
                  <p className="mt-1 text-muted-foreground">
                    {completedToday.length} / {habits.length} habits completed today
                  </p>
                </div>
                <div className="relative grid h-20 w-20 place-items-center rounded-full" style={{ background: `conic-gradient(var(--color-primary) ${completion * 3.6}deg, var(--color-muted) 0deg)` }}><div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-card text-center"><p className="text-lg font-bold leading-none tabular-nums">{completedToday.length}<span className="text-muted-foreground">/{habits.length}</span></p><p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">done</p></div></div>
              </div>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3 sm:max-w-xl">
            <StatCard icon={CheckCircle2} label="Done today" value={`${completedToday.length}/${habits.length}`} />
            <StatCard icon={Flame} label="Active streaks" value={habits.filter((h) => h.currentStreak > 0).length} />
            <StatCard icon={Trophy} label="Best streak" value={`${longestStreak}d`} />
          </div>

          {/* Remaining habits */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your habits</p><h2 className="mt-1 text-lg font-semibold">Today’s focus</h2></div>
              <span className="text-sm text-muted-foreground">
                {remainingHabits.length} left
              </span>
            </div>

            {loading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {[1, 2].map((item) => (
                  <div key={item} className="h-56 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : remainingHabits.length === 0 ? (
              <Card>
                <CardContent className="py-14 text-center">
                  <div className="mb-4 text-6xl">🎉</div>
                  <h2 className="text-2xl font-semibold">Everything completed!</h2>
                  <p className="mt-2 text-muted-foreground">
                    Amazing work. Enjoy your streak today.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {remainingHabits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} userId={user.uid} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  )
}
