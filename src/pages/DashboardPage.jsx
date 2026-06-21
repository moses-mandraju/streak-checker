import { CheckCircle2, Flame, ListChecks, Trophy } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import HabitCard from '../components/HabitCard'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'
import { todayKey } from '../utils/date'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const habits = useHabitStore((state) => state.habits)
  const loading = useHabitStore((state) => state.loading)
  const completedToday = habits.filter((habit) =>
    (habit.completionHistory || []).includes(todayKey()),
  ).length
  const longestStreak = habits.reduce(
    (max, habit) => Math.max(max, habit.longestStreak || 0),
    0,
  )

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome, ${user?.displayName?.split(' ')[0] || 'there'}`}
        description="A calm view of your habit momentum for today."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ListChecks} label="Total habits" value={habits.length} />
        <StatCard icon={CheckCircle2} label="Completed today" value={completedToday} />
        <StatCard icon={Trophy} label="Longest streak" value={longestStreak} />
        <StatCard
          icon={Flame}
          label="Active streaks"
          value={habits.filter((habit) => habit.currentStreak > 0).length}
        />
      </div>
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Today&apos;s habits</h2>
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2].map((item) => (
              <div key={item} className="h-56 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {habits.slice(0, 4).map((habit) => (
              <HabitCard key={habit.id} habit={habit} userId={user.uid} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
