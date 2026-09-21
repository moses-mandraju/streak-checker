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

  return format(
    new Date(`${value}T00:00:00`),
    'MMM d, yyyy',
  )
}

export function getCompletionStats(habit) {
  const history = habit.completionHistory || []

  const created = habit.createdDate
    ? new Date(`${habit.createdDate}T00:00:00`)
    : new Date()

  const totalDays = Math.max(
    differenceInCalendarDays(new Date(), created) + 1,
    1,
  )

  const percentage = Math.round(
    (history.length / totalDays) * 100,
  )

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

    cursor = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate() + 1,
    )
  }

  return {
    days,
    start,
    end,
  }
}

export function isCompletedOn(habit, day) {
  return (habit.completionHistory || []).some((date) =>
    isSameDay(
      new Date(`${date}T00:00:00`),
      day,
    ),
  )
}

export function isCurrentMonth(day, monthDate) {
  return isSameMonth(day, monthDate)
}

/**
 * Complete today and calculate the streak from the
 * actual completion history.
 */
export function calculateNextStreak(habit) {
  const today = todayKey()
  const history = habit.completionHistory || []

  if (history.includes(today)) {
    throw new Error('This habit is already completed today.')
  }

  const nextHistory = [...history, today]

  return calculateStreaksFromHistory(nextHistory)
}

/**
 * Recalculates both current and longest streaks from
 * the complete completion history.
 *
 * Current streak rules:
 * - If today is completed, count backwards from today.
 * - If today is not completed yet, count backwards from yesterday.
 *
 * Therefore:
 *
 * Yesterday ✓
 * Today     ○
 *
 * => current streak still includes yesterday.
 */
export function calculateStreaksFromHistory(completionHistory) {
  const history = [...new Set(completionHistory || [])]
    .filter(Boolean)
    .sort()

  const completed = new Set(history)

  // Calculate longest streak across the entire history.
  let longestStreak = 0
  let runningStreak = 0
  let previousDate = null

  history.forEach((key) => {
    const date = new Date(`${key}T00:00:00`)

    if (
      previousDate &&
      differenceInCalendarDays(date, previousDate) === 1
    ) {
      runningStreak += 1
    } else {
      runningStreak = 1
    }

    longestStreak = Math.max(
      longestStreak,
      runningStreak,
    )

    previousDate = date
  })

  // Calculate current streak.
  let currentStreak = 0

  const today = new Date()
  const todayCompleted = completed.has(
    format(today, DATE_KEY),
  )

  // If today isn't completed, start from yesterday.
  let cursor = todayCompleted
    ? today
    : subDays(today, 1)

  while (
    completed.has(format(cursor, DATE_KEY))
  ) {
    currentStreak += 1
    cursor = subDays(cursor, 1)
  }

  return {
    completionHistory: history,
    currentStreak,
    longestStreak,
    lastCompletedDate: history.at(-1) || '',
  }
}