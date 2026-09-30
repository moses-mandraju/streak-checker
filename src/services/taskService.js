import {
  createTaskDocument,
  updateTaskDocument,
  deleteTaskDocument,
} from '../firebase/firestore'
import { todayKey } from '../utils/date'

export function createTask(userId, title) {
  return createTaskDocument(userId, {
    title: title.trim(),
    dueDate: todayKey(),
    completed: false,
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
