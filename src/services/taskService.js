import { addDays, format } from 'date-fns'
import {
  createTaskDocument,
  updateTaskDocument,
  deleteTaskDocument,
} from '../firebase/firestore'
import { DATE_KEY, todayKey } from '../utils/date'
import { DEFAULT_INCOMPLETE_ACTION, getOverdueTaskAction } from '../utils/task-lifecycle'

export function createTask(userId, title, incompleteAction = DEFAULT_INCOMPLETE_ACTION) {
  return createTaskDocument(userId, {
    title: title.trim(),
    dueDate: todayKey(),
    completed: false,
    incompleteAction,
    createdAt: new Date().toISOString(),
  })
}

export function toggleTask(userId, task) {
  return updateTaskDocument(userId, task.id, {
    completed: !task.completed,
  })
}

export function deleteTask(userId, taskId) {
  return deleteTaskDocument(userId, taskId)
}

export function setTaskIncompleteAction(userId, taskId, incompleteAction) {
  return updateTaskDocument(userId, taskId, { incompleteAction })
}

export function moveTaskToTomorrow(userId, taskId) {
  const tomorrow = format(
    addDays(new Date(`${todayKey()}T00:00:00`), 1),
    DATE_KEY,
  )
  return updateTaskDocument(userId, taskId, { dueDate: tomorrow })
}

export function reconcileOverdueTask(userId, task, today = todayKey()) {
  const action = getOverdueTaskAction(task, today)
  if (!action) return Promise.resolve()

  if (action.type === 'delete') {
    return deleteTaskDocument(userId, task.id)
  }

  return updateTaskDocument(userId, task.id, { dueDate: action.dueDate })
}
