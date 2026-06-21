import {
  createHabitDocument,
  deleteHabitDocument,
  updateHabitDocument,
} from '../firebase/firestore'
import { calculateNextStreak, todayKey } from '../utils/date'

export function createHabit(userId, values) {
  return createHabitDocument(userId, {
    title: values.title.trim(),
    emoji: values.emoji.trim() || '✅',
    createdDate: todayKey(),
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: '',
    completionHistory: [],
  })
}

export function updateHabit(userId, habitId, values) {
  return updateHabitDocument(userId, habitId, {
    title: values.title.trim(),
    emoji: values.emoji.trim() || '✅',
  })
}

export function deleteHabit(userId, habitId) {
  return deleteHabitDocument(userId, habitId)
}

export function completeHabit(userId, habit) {
  return updateHabitDocument(userId, habit.id, calculateNextStreak(habit))
}
