import {
  createHabitDocument,
  deleteHabitDocument,
  updateHabitDocument,
} from '../firebase/firestore'
import { calculateNextStreak, todayKey } from '../utils/date'

export const defaultReminderSettings = {
  reminderEnabled: false,
  reminderTime: '09:00',
  reminderFrequency: 'Daily',
  selectedDays: [],
  notificationTitle: '',
  notificationMessage: '',
  reminderTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
}

export function createHabit(userId, values) {
  return createHabitDocument(userId, {
    title: values.title.trim(),
    emoji: values.emoji.trim() || '✅',
    createdDate: todayKey(),
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: '',
    completionHistory: [],
    ...defaultReminderSettings,
  })
}

export function updateHabit(userId, habitId, values) {
  return updateHabitDocument(userId, habitId, {
    title: values.title.trim(),
    emoji: values.emoji.trim() || '✅',
  })
}

export function updateHabitReminder(userId, habitId, reminderSettings) {
  // Future: Firebase Cloud Messaging and Cloud Functions can use this reminder schema
  // to schedule push notifications without schema migration.
  return updateHabitDocument(userId, habitId, {
    reminderEnabled: reminderSettings.reminderEnabled ?? defaultReminderSettings.reminderEnabled,
    reminderTime: reminderSettings.reminderTime || defaultReminderSettings.reminderTime,
    reminderFrequency: reminderSettings.reminderFrequency || defaultReminderSettings.reminderFrequency,
    selectedDays: reminderSettings.selectedDays || defaultReminderSettings.selectedDays,
    notificationTitle: reminderSettings.notificationTitle || defaultReminderSettings.notificationTitle,
    notificationMessage: reminderSettings.notificationMessage || defaultReminderSettings.notificationMessage,
    reminderTimezone:
      reminderSettings.reminderTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  })
}

export function deleteHabit(userId, habitId) {
  return deleteHabitDocument(userId, habitId)
}

export function completeHabit(userId, habit) {
  return updateHabitDocument(userId, habit.id, calculateNextStreak(habit))
}
