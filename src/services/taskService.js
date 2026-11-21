import { addDays, format } from 'date-fns'
import {
  createTaskDocument,
  updateTaskDocument,
  deleteTaskDocument,
} from '../firebase/firestore'
import { DATE_KEY, todayKey } from '../utils/date'
import { DEFAULT_INCOMPLETE_ACTION } from '../utils/task-lifecycle'
import { getTaskReminderStatus } from '../utils/task-planner'

export function createTask(userId, task, incompleteAction = DEFAULT_INCOMPLETE_ACTION) {
  const values = typeof task === 'string'
    ? { title: task, dueDate: todayKey(), incompleteAction }
    : task

  return createTaskDocument(userId, {
    title: values.title.trim(),
    description: values.description?.trim() || '',
    dueDate: values.dueDate || todayKey(),
    startTime: values.startTime || '',
    endTime: values.endTime || '',
    allDay: Boolean(values.allDay),
    completed: false,
    incompleteAction: values.incompleteAction || DEFAULT_INCOMPLETE_ACTION,
    notificationEnabled: Boolean(values.notificationEnabled),
    reminderMinutesBefore: Number(values.reminderMinutesBefore) || 0,
    reminderStatus: getTaskReminderStatus(values.notificationEnabled),
    reminderClaimedAt: '',
    reminderSentAt: '',
    timezone: values.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

export function updateTask(userId, taskId, values) {
  return updateTaskDocument(userId, taskId, {
    title: values.title.trim(),
    description: values.description?.trim() || '',
    dueDate: values.dueDate,
    startTime: values.startTime || '',
    endTime: values.endTime || '',
    allDay: Boolean(values.allDay),
    notificationEnabled: Boolean(values.notificationEnabled),
    reminderMinutesBefore: Number(values.reminderMinutesBefore) || 0,
    reminderStatus: getTaskReminderStatus(values.notificationEnabled, values.completed),
    reminderClaimedAt: '',
    reminderSentAt: '',
    timezone: values.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    updatedAt: new Date().toISOString(),
  })
}

export function toggleTask(userId, task) {
  return updateTaskDocument(userId, task.id, {
    completed: !task.completed,
    reminderStatus: getTaskReminderStatus(task.notificationEnabled, !task.completed),
    reminderClaimedAt: '',
    reminderSentAt: task.completed ? task.reminderSentAt || '' : '',
    updatedAt: new Date().toISOString(),
  })
}

export function deleteTask(userId, taskId) {
  return deleteTaskDocument(userId, taskId)
}

export function setTaskIncompleteAction(userId, taskId, incompleteAction) {
  return updateTaskDocument(userId, taskId, {
    incompleteAction,
    updatedAt: new Date().toISOString(),
  })
}

export function moveTaskToTomorrow(userId, task) {
  const tomorrow = format(
    addDays(new Date(`${todayKey()}T00:00:00`), 1),
    DATE_KEY,
  )
  return updateTaskDocument(userId, task.id, {
    dueDate: tomorrow,
    reminderStatus: getTaskReminderStatus(task.notificationEnabled),
    reminderClaimedAt: '',
    reminderSentAt: '',
    updatedAt: new Date().toISOString(),
  })
}
