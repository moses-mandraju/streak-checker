import {
  createHabitDocument,
  deleteHabitDocument,
  updateHabitDocument,
} from '../firebase/firestore'

import {
  calculateNextStreak,
  calculateStreaksFromHistory,
  getCurrentStreak,
  todayKey,
} from '../utils/date'
import { getReachedStreakMilestone } from '../utils/streak-milestones'

export const defaultReminderSettings = {
  reminderEnabled: false,
  reminderTime: '09:00',
  reminderFrequency: 'Daily',
  selectedDays: [],
  notificationTitle: '',
  notificationMessage: '',
  reminderTimezone:
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'UTC',
}

export function createHabit(userId, values) {
  return createHabitDocument(userId, {
    title: values.title.trim(),

    category:
      values.category || 'consistency',

    frequencyType: values.frequencyType || 'daily',
    weeklyTarget: Number(values.weeklyTarget) || 3,
    scheduledDays: values.scheduledDays || [],

    emoji:
      values.emoji.trim() || '✅',

    createdDate: todayKey(),

    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: '',

    completionHistory: [],
    celebratedMilestones: [],

    ...defaultReminderSettings,
  })
}

export function updateHabit(
  userId,
  habitId,
  values,
) {
  return updateHabitDocument(userId, habitId, {
    title: values.title.trim(),

    category:
      values.category || 'consistency',

    frequencyType: values.frequencyType || 'daily',
    weeklyTarget: Number(values.weeklyTarget) || 3,
    scheduledDays: values.scheduledDays || [],

    emoji:
      values.emoji.trim() || '✅',
  })
}

export function updateHabitReminder(
  userId,
  habitId,
  reminderSettings,
) {
  return updateHabitDocument(userId, habitId, {
    reminderEnabled:
      reminderSettings.reminderEnabled ??
      defaultReminderSettings.reminderEnabled,

    reminderTime:
      reminderSettings.reminderTime ||
      defaultReminderSettings.reminderTime,

    reminderFrequency:
      reminderSettings.reminderFrequency ||
      defaultReminderSettings.reminderFrequency,

    selectedDays:
      reminderSettings.selectedDays ||
      defaultReminderSettings.selectedDays,

    notificationTitle:
      reminderSettings.notificationTitle ||
      defaultReminderSettings.notificationTitle,

    notificationMessage:
      reminderSettings.notificationMessage ||
      defaultReminderSettings.notificationMessage,

    reminderTimezone:
      reminderSettings.reminderTimezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      'UTC',
  })
}

export function deleteHabit(userId, habitId) {
  return deleteHabitDocument(
    userId,
    habitId,
  )
}

export async function completeHabit(userId, habit) {
  const previousStreak = getCurrentStreak(habit)
  const updates = calculateNextStreak(habit)
  const milestoneReached = getReachedStreakMilestone(
    habit,
    previousStreak,
    updates.currentStreak,
  )

  if (milestoneReached) {
    updates.celebratedMilestones = [
      ...new Set([...(habit.celebratedMilestones || []).map(Number), milestoneReached]),
    ]
  }

  await updateHabitDocument(userId, habit.id, updates)
  return { ...updates, milestoneReached }
}

export async function toggleHabitCompletionForDate(
  userId,
  habit,
  dateKey,
) {
  if (dateKey > todayKey()) {
    throw new Error(
      'Future dates cannot be completed.',
    )
  }

  const history =
    habit.completionHistory || []

  const wasCompleted = history.includes(dateKey)
  const nextHistory = wasCompleted
    ? history.filter(
        (key) => key !== dateKey,
      )
    : [...history, dateKey]

  const previousStreak = getCurrentStreak(habit)
  const updates = calculateStreaksFromHistory(nextHistory, habit)
  const milestoneReached = wasCompleted
    ? null
    : getReachedStreakMilestone(
        habit,
        previousStreak,
        updates.currentStreak,
        dateKey,
        todayKey(),
      )

  if (milestoneReached) {
    updates.celebratedMilestones = [
      ...new Set([...(habit.celebratedMilestones || []).map(Number), milestoneReached]),
    ]
  }

  await updateHabitDocument(userId, habit.id, updates)
  return { ...updates, milestoneReached }
}