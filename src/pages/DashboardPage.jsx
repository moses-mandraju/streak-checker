import {
  CheckCircle2,
  Flame,
  ListChecks,
  Trophy,
  ArrowRight,
} from 'lucide-react'

import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import HabitCard from '../components/HabitCard'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'

import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'

import { todayKey } from '../utils/date'

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

  const nextHabit = remainingHabits[0]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Good ${greeting}, ${user?.displayName?.split(' ')[0] || 'there'} 👋`}
        description="Stay consistent. Small wins every day become big victories."
      />

      {habits.length === 0 ? (
        <Card className="mb-8 border-primary/20">
          <CardContent className="py-16 text-center">
            <div className="text-6xl">🌱</div>
            <h2 className="mt-6 text-3xl font-semibold">
              Welcome to Streak Checker
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Create your first habit and start building consistency one day at a time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Today's progress bar */}
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Today's Progress</h2>
                  <p className="mt-1 text-muted-foreground">
                    {completedToday.length} / {habits.length} habits completed today
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-primary">{completion}%</p>
                  <p className="text-xs text-muted-foreground">Today's completion</p>
                </div>
              </div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={ListChecks} label="Total Habits" value={habits.length} />
            <StatCard icon={CheckCircle2} label="Completed Today" value={completedToday.length} />
            <StatCard icon={Trophy} label="Longest Streak" value={longestStreak} />
            <StatCard
              icon={Flame}
              label="Active Streaks"
              value={habits.filter((h) => h.currentStreak > 0).length}
            />
          </div>

          {/* Up next */}
          {nextHabit && (
            <Card className="mt-8">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Up Next</p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {nextHabit.emoji} {nextHabit.title}
                  </h2>
                </div>
                <Button>
                  Mark Complete
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Remaining habits */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Today's Remaining Habits</h2>
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
