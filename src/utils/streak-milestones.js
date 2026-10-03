import { getStreakUnit, todayKey } from './date.js'

export const STREAK_MILESTONES = [7, 14, 21, 28, 50, 100]

export function getReachedStreakMilestone(
  habit,
  previousStreak,
  currentStreak,
  completedDate = todayKey(),
  today = todayKey(),
) {
  if (completedDate !== today) return null

  if (getStreakUnit(habit) !== 'day' || currentStreak <= previousStreak) {
    return null
  }

  const celebrated = new Set(
    (Array.isArray(habit?.celebratedMilestones) ? habit.celebratedMilestones : [])
      .map(Number),
  )

  return STREAK_MILESTONES.find((milestone) =>
    previousStreak < milestone &&
    currentStreak >= milestone &&
    !celebrated.has(milestone),
  ) || null
}