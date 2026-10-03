import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_INCOMPLETE_ACTION,
  DELETE_INCOMPLETE_ACTION,
  getOverdueTaskAction,
} from './task-lifecycle.js'

test('legacy and move-policy tasks move the same overdue task directly to today', () => {
  const legacyTask = { id: 'legacy', dueDate: '2026-09-30', completed: false }
  const task = {
    id: 'task-1',
    dueDate: '2026-09-28',
    completed: false,
    incompleteAction: DEFAULT_INCOMPLETE_ACTION,
  }

  assert.deepEqual(getOverdueTaskAction(legacyTask, '2026-10-03'), {
    type: 'move',
    dueDate: '2026-10-03',
  })
  assert.deepEqual(getOverdueTaskAction(task, '2026-10-03'), {
    type: 'move',
    dueDate: '2026-10-03',
  })
})

test('delete policy expires overdue incomplete tasks only after their date passes', () => {
  const task = {
    dueDate: '2026-10-02',
    completed: false,
    incompleteAction: DELETE_INCOMPLETE_ACTION,
  }

  assert.equal(getOverdueTaskAction(task, '2026-10-02'), null)
  assert.deepEqual(getOverdueTaskAction(task, '2026-10-03'), { type: 'delete' })
})

test('completed tasks and tasks dated today or later are never reconciled', () => {
  assert.equal(
    getOverdueTaskAction({
      dueDate: '2026-10-01',
      completed: true,
      incompleteAction: DELETE_INCOMPLETE_ACTION,
    }, '2026-10-03'),
    null,
  )
  assert.equal(
    getOverdueTaskAction({ dueDate: '2026-10-03', completed: false }, '2026-10-03'),
    null,
  )
  assert.equal(
    getOverdueTaskAction({ dueDate: '2026-10-04', completed: false }, '2026-10-03'),
    null,
  )
})