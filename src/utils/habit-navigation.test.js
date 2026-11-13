import assert from 'node:assert/strict'
import test from 'node:test'
import { getHabitNavigation } from './habit-navigation.js'

test('habit navigation stays within category and preserves category order', () => {
  const habits = [
    { id: 'consistency-1', category: 'consistency' },
    { id: 'resistance-1', category: 'resistance' },
    { id: 'consistency-2', category: 'consistency' },
    { id: 'resistance-2', category: 'resistance' },
    { id: 'consistency-3', category: 'consistency' },
  ]

  assert.deepEqual(
    getHabitNavigation(habits, habits[2]),
    { previous: habits[0], next: habits[4] },
  )
  assert.deepEqual(
    getHabitNavigation(habits, habits[3]),
    { previous: habits[1], next: null },
  )
})

test('habit navigation does not wrap at category boundaries', () => {
  const habits = [
    { id: 'resistance-1', category: 'resistance' },
    { id: 'consistency-1' },
    { id: 'resistance-2', category: 'resistance' },
  ]

  assert.deepEqual(
    getHabitNavigation(habits, habits[0]),
    { previous: null, next: habits[2] },
  )
  assert.deepEqual(
    getHabitNavigation(habits, habits[2]),
    { previous: habits[0], next: null },
  )
})
