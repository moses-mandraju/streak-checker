import WeeklyDashboardReport from '../components/WeeklyDashboardReport'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const habits = useHabitStore((state) => state.habits)

  return <WeeklyDashboardReport habits={habits} user={user} />
}
