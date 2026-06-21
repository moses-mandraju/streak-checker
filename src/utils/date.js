import {
  differenceInCalendarDays,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subDays,
} from 'date-fns'

export const DATE_KEY = 'yyyy-MM-dd'

export function todayKey() {
  return format(new Date(), DATE_KEY)
}

export function formatDate(value, fallback = 'Not yet') {
  if (!value) return fallback
  return format(new Date(`${value}T00:00:00`), 'MMM d, yyyy')
}

export function getCompletionStats(habit) {
  const history = habit.completionHistory || []
  const created = habit.createdDate
    ? new Date(`${habit.createdDate}T00:00:00`)
    : new Date()
  const totalDays = Math.max(differenceInCalendarDays(new Date(), created) + 1, 1)
  const percentage = Math.round((history.length / totalDays) * 100)

  return {
    totalCompletedDays: history.length,
    completionPercentage: Math.min(percentage, 100),
  }
}

export function getMonthDays(monthDate) {
  const start = startOfMonth(monthDate)
  const end = endOfMonth(monthDate)
  const days = []
  let cursor = start

  while (cursor <= end) {
    days.push(cursor)
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
  }

  return { days, start, end }
}

export function isCompletedOn(habit, day) {
  return (habit.completionHistory || []).some((date) =>
    isSameDay(new Date(`${date}T00:00:00`), day),
  )
}

export function isCurrentMonth(day, monthDate) {
  return isSameMonth(day, monthDate)
}

export function calculateNextStreak(habit) {
  const today = todayKey()
  const yesterday = format(subDays(new Date(), 1), DATE_KEY)
  const history = habit.completionHistory || []

  if (history.includes(today)) {
    throw new Error('This habit is already completed today.')
  }

  const currentStreak =
    habit.lastCompletedDate === yesterday ? (habit.currentStreak || 0) + 1 : 1
  const longestStreak = Math.max(currentStreak, habit.longestStreak || 0)

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate: today,
    completionHistory: [...history, today],
  }
}
