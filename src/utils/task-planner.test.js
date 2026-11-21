import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getMonthCalendarDays,
  getTaskReminderStatus,
  getTasksForView,
  parseDateKey,
  taskTimeLabel,
  validateTaskDetails,
} from './task-planner.js'

test('calendar month navigation grid contains complete weeks around the selected month', () => {
  const days = getMonthCalendarDays(new Date(2026, 1, 15))

  assert.equal(days.length % 7, 0)
  assert.equal(days[0].getDay(), 0)
  assert.equal(days[days.length - 1].getDay(), 6)
  assert.ok(days.some((day) => day.getMonth() === 1))
})

test('date selection parses local calendar dates without shifting time zones', () => {
  const parsed = parseDateKey('2026-03-08')
  assert.equal(parsed.getFullYear(), 2026)
  assert.equal(parsed.getMonth(), 2)
  assert.equal(parsed.getDate(), 8)
  assert.equal(parseDateKey('2026-02-30'), null)
})

test('task views retain overdue work and keep completed history in the appropriate view', () => {
  const tasks = [
    { id: 'overdue', dueDate: '2026-11-18', completed: false },
    { id: 'today', dueDate: '2026-11-21', completed: false },
    { id: 'done-today', dueDate: '2026-11-21', completed: true },
    { id: 'future', dueDate: '2026-11-24', completed: false },
    { id: 'done-old', dueDate: '2026-11-18', completed: true },
  ]

  assert.deepEqual(
    getTasksForView(tasks, 'today', '2026-11-21').map((task) => task.id),
    ['overdue', 'today', 'done-today'],
  )
  assert.deepEqual(
    getTasksForView(tasks, 'upcoming', '2026-11-21').map((task) => task.id),
    ['overdue', 'future'],
  )
  assert.deepEqual(
    getTasksForView(tasks, 'calendar', '2026-11-21', '2026-11-18').map((task) => task.id),
    ['overdue', 'done-old'],
  )
  assert.equal(tasks.find((task) => task.id === 'overdue').dueDate, '2026-11-18')
})

test('legacy tasks missing optional date fields safely default to today', () => {
  const tasks = [{ id: 'legacy-anytime', title: 'Legacy', completed: false }]

  assert.deepEqual(
    getTasksForView(tasks, 'today', '2026-11-21').map((task) => task.id),
    ['legacy-anytime'],
  )
  assert.deepEqual(
    getTasksForView(tasks, 'calendar', '2026-11-21', '2026-11-21').map((task) => task.id),
    ['legacy-anytime'],
  )
  assert.deepEqual(getTasksForView(tasks, 'upcoming', '2026-11-21'), [])
})

test('task times require valid values and a later end, while allowing overlaps', () => {
  const baseTask = {
    title: 'Calendar event',
    dueDate: '2026-11-21',
    startTime: '10:00',
    endTime: '11:00',
    allDay: false,
  }
  assert.equal(validateTaskDetails(baseTask), '')
  assert.equal(validateTaskDetails({ ...baseTask, endTime: '10:00' }), 'End time must be later than start time.')
  assert.equal(validateTaskDetails({ ...baseTask, startTime: '25:00' }), 'Enter a valid start time.')
  assert.equal(validateTaskDetails({ ...baseTask, notificationEnabled: true }), '')
  assert.equal(validateTaskDetails({
    title: 'All day',
    dueDate: '2026-11-21',
    allDay: true,
    notificationEnabled: true,
  }), '')

  const overlappingTask = { ...baseTask, startTime: '10:30', endTime: '11:30' }
  assert.equal(validateTaskDetails(overlappingTask), '')
})

test('all-day and anytime tasks are labeled separately', () => {
  assert.equal(taskTimeLabel({ allDay: true }), 'All day')
  assert.equal(taskTimeLabel({}), 'Anytime')
  assert.equal(taskTimeLabel({ startTime: '09:30', endTime: '10:30' }), '09:30 – 10:30')
})

test('reminder state cancels on completion and returns to pending when reopened', () => {
  assert.equal(getTaskReminderStatus(false), 'disabled')
  assert.equal(getTaskReminderStatus(true), 'pending')
  assert.equal(getTaskReminderStatus(true, true), 'cancelled')
})
