import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { DATE_KEY, todayKey } from './date.js'

export function getDateKey(date = new Date()) {
  return format(date, DATE_KEY)
}

export function parseDateKey(dateKey) {
  const parsed = parse(dateKey, DATE_KEY, new Date())
  return isValid(parsed) && format(parsed, DATE_KEY) === dateKey
    ? parsed
    : null
}

export function getMonthCalendarDays(monthDate) {
  const monthStart = startOfMonth(monthDate)
  return eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 }),
  })
}

export function compareTaskTimes(left, right) {
  const leftTime = left.startTime || (left.allDay ? '00:00' : '99:99')
  const rightTime = right.startTime || (right.allDay ? '00:00' : '99:99')
  return leftTime.localeCompare(rightTime) ||
    (left.title || '').localeCompare(right.title || '')
}

export function getTasksForView(tasks, view, today, selectedDate) {
  const selected = tasks.filter((task) => {
    const dueDate = task.dueDate || today
    if (view === 'calendar') return dueDate === selectedDate
    if (view === 'today') {
      return dueDate <= today && (!task.completed || dueDate === today)
    }
    return dueDate !== today && (dueDate > today || !task.completed)
  })

  return selected.sort((left, right) =>
    (left.dueDate || today).localeCompare(right.dueDate || today) ||
      compareTaskTimes(left, right),
  )
}

export function isValidTaskTime(value) {
  if (!value) return true
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return false

  const [hours, minutes] = value.split(':').map(Number)
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

export function validateTaskDetails(task, { today = todayKey(), allowPastDate = false } = {}) {
  if (!task.title?.trim()) return 'A task title is required.'
  if (!parseDateKey(task.dueDate)) return 'Choose a valid date.'
  if (!allowPastDate && task.dueDate < today) return 'Choose today or a future date.'
  if (!task.allDay && !isValidTaskTime(task.startTime)) return 'Enter a valid start time.'
  if (!task.allDay && !isValidTaskTime(task.endTime)) return 'Enter a valid end time.'
  if (
    !task.allDay &&
    task.startTime &&
    task.endTime &&
    task.endTime <= task.startTime
  ) {
    return 'End time must be later than start time.'
  }
  if (task.notificationEnabled && !task.allDay && !task.startTime) {
    return 'Set a start time before enabling a reminder.'
  }
  return ''
}

export function taskTimeLabel(task) {
  if (task.allDay) return 'All day'
  if (!task.startTime && !task.endTime) return 'Anytime'
  if (task.startTime && task.endTime) return `${task.startTime} – ${task.endTime}`
  return task.startTime || `Until ${task.endTime}`
}

export function getTaskReminderStatus(notificationEnabled, completed = false) {
  if (!notificationEnabled) return 'disabled'
  return completed ? 'cancelled' : 'pending'
}

