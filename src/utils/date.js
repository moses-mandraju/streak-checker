import {
  differenceInCalendarDays,
  addDays,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  subDays,
} from 'date-fns'

export const DATE_KEY = 'yyyy-MM-dd'

export function getFrequencyType(habit) {
  return habit?.frequencyType === 'weekly' || habit?.frequencyType === 'specific-days'
    ? habit.frequencyType
    : 'daily'
}

export function getStreakUnit(habit) {
  return getFrequencyType(habit) === 'weekly' ? 'week' : 'day'
}

export function getDashboardDateKeys(category, asOfDate = new Date()) {
  const offset = category === 'consistency' ? 0 : 1
  return Array.from({ length: 7 }, (_, index) =>
    format(subDays(asOfDate, index + offset), DATE_KEY),
  ).reverse()
}

function getWeeklyTarget(habit) {
  const target = Number(habit?.weeklyTarget)
  return [3, 4, 5, 6].includes(target) ? target : 3
}

function getScheduledDays(habit) {
  return new Set(
    (Array.isArray(habit?.scheduledDays) ? habit.scheduledDays : [])
      .map(Number)
      .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6),
  )
}

function getCreatedDateKey(habit) {
  return habit?.createdDate || ''
}

function getDateKeysBetween(startKey, endKey) {
  if (!startKey || startKey > endKey) return []

  const keys = []
  let cursor = new Date(`${startKey}T00:00:00`)
  const end = new Date(`${endKey}T00:00:00`)

  while (cursor <= end) {
    keys.push(format(cursor, DATE_KEY))
    cursor = addDays(cursor, 1)
  }

  return keys
}

function expectedWeeklyTarget(habit, activeDays) {
  if (activeDays <= 0) return 0
  return Math.min(getWeeklyTarget(habit), Math.ceil(getWeeklyTarget(habit) * activeDays / 7))
}

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

  if (getFrequencyType(habit) !== 'daily') {
    const createdDate = getCreatedDateKey(habit) || todayKey()
    const today = todayKey()
    const completed = new Set(history.filter((key) => key >= createdDate && key <= today))
    let possible = 0
    let credited = 0

    if (getFrequencyType(habit) === 'specific-days') {
      const scheduledDays = getScheduledDays(habit)
      const expectedDates = getDateKeysBetween(createdDate, today)
        .filter((key) => scheduledDays.has(getDay(new Date(`${key}T00:00:00`))))
      possible = expectedDates.length
      credited = expectedDates.filter((key) => completed.has(key)).length
    } else {
      let weekStart = startOfWeek(new Date(`${createdDate}T00:00:00`), { weekStartsOn: 1 })
      const currentWeekStart = startOfWeek(new Date(`${today}T00:00:00`), { weekStartsOn: 1 })

      while (weekStart <= currentWeekStart) {
        const weekEnd = addDays(weekStart, 6)
        const activeStart = format(weekStart, DATE_KEY) < createdDate
          ? new Date(`${createdDate}T00:00:00`)
          : weekStart
        const activeEnd = weekEnd < new Date(`${today}T00:00:00`)
          ? weekEnd
          : new Date(`${today}T00:00:00`)
        const activeDays = Math.max(differenceInCalendarDays(activeEnd, activeStart) + 1, 0)
        const goal = expectedWeeklyTarget(habit, activeDays)
        const weekKey = format(weekStart, DATE_KEY)
        const weekEndKey = format(activeEnd, DATE_KEY)
        const weekCompletions = [...completed].filter((key) => key >= weekKey && key <= weekEndKey).length

        possible += goal
        credited += Math.min(weekCompletions, goal)
        weekStart = addDays(weekStart, 7)
      }
    }

    const percentage = possible
      ? Math.round((credited / possible) * 100)
      : 0

    return {
      totalCompletedDays: history.length,
      completionPercentage: Math.min(percentage, 100),
    }
  }

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

  return calculateStreaksFromHistory(nextHistory, habit)
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
export function calculateStreaksFromHistory(completionHistory, habit) {
  if (getFrequencyType(habit) !== 'daily') {
    return calculateScheduledStreaks(habit, completionHistory)
  }

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

export function calculateScheduledStreaks(habit, completionHistory, asOfDate = new Date()) {
  const history = [...new Set(completionHistory || [])].filter(Boolean).sort()
  const createdDate = getCreatedDateKey(habit)
  const asOfKey = format(asOfDate, DATE_KEY)
  const completed = new Set(history.filter((key) => (!createdDate || key >= createdDate) && key <= asOfKey))

  if (getFrequencyType(habit) === 'specific-days') {
    const scheduledDays = getScheduledDays(habit)
    const startKey = createdDate || history[0] || asOfKey
    const expectedDates = getDateKeysBetween(startKey, asOfKey)
      .filter((key) => scheduledDays.has(getDay(new Date(`${key}T00:00:00`))))
    let longestStreak = 0
    let runningStreak = 0

    for (const key of expectedDates) {
      if (completed.has(key)) {
        runningStreak += 1
        longestStreak = Math.max(longestStreak, runningStreak)
      } else {
        runningStreak = 0
      }
    }

    let currentStreak = 0
    let index = expectedDates.length - 1
    if (expectedDates[index] === asOfKey && !completed.has(asOfKey)) index -= 1
    while (index >= 0 && completed.has(expectedDates[index])) {
      currentStreak += 1
      index -= 1
    }

    return {
      completionHistory: history,
      currentStreak,
      longestStreak,
      lastCompletedDate: history.at(-1) || '',
    }
  }

  const created = new Date(`${createdDate || history[0] || asOfKey}T00:00:00`)
  let weekStart = startOfWeek(created, { weekStartsOn: 1 })
  const currentWeekStart = startOfWeek(asOfDate, { weekStartsOn: 1 })
  const weeks = []
  let longestStreak = 0
  let runningStreak = 0

  while (weekStart <= currentWeekStart) {
    const weekEnd = addDays(weekStart, 6)
    const activeStart = format(weekStart, DATE_KEY) < (createdDate || format(created, DATE_KEY))
      ? created
      : weekStart
    const activeDays = Math.max(differenceInCalendarDays(weekEnd, activeStart) + 1, 0)
    const goal = expectedWeeklyTarget(habit, activeDays)
    const weekStartKey = format(weekStart, DATE_KEY)
    const weekEndKey = format(weekEnd, DATE_KEY)
    const count = [...completed].filter((key) => key >= weekStartKey && key <= weekEndKey).length
    const achieved = count >= goal && goal > 0

    weeks.push(achieved)
    if (achieved) {
      runningStreak += 1
      longestStreak = Math.max(longestStreak, runningStreak)
    } else {
      runningStreak = 0
    }

    weekStart = addDays(weekStart, 7)
  }

  let currentStreak = 0
  let weekIndex = weeks.length - 1
  if (!weeks[weekIndex]) weekIndex -= 1
  while (weekIndex >= 0 && weeks[weekIndex]) {
    currentStreak += 1
    weekIndex -= 1
  }

  return {
    completionHistory: history,
    currentStreak,
    longestStreak,
    lastCompletedDate: history.at(-1) || '',
  }
}

export function getScheduleProgress(habit, dateKeys) {
  const frequencyType = getFrequencyType(habit)
  const history = new Set(habit?.completionHistory || [])

  if (frequencyType === 'daily') {
    const completed = dateKeys.filter((key) => history.has(key)).length
    return { completed, possible: dateKeys.length }
  }

  if (frequencyType === 'specific-days') {
    const scheduledDays = getScheduledDays(habit)
    const expectedDates = dateKeys.filter((key) =>
      scheduledDays.has(getDay(new Date(`${key}T00:00:00`))),
    )
    return {
      completed: expectedDates.filter((key) => history.has(key)).length,
      possible: expectedDates.length,
    }
  }

  const possible = getWeeklyTarget(habit)
  const completed = Math.min(dateKeys.filter((key) => history.has(key)).length, possible)
  return { completed, possible }
}

export function getCurrentStreak(habit) {
  return calculateStreaksFromHistory(
    habit?.completionHistory || [],
    habit,
  ).currentStreak
}

export function getLongestStreak(habit) {
  return calculateStreaksFromHistory(
    habit?.completionHistory || [],
    habit,
  ).longestStreak
}
