export const DEFAULT_INCOMPLETE_ACTION = 'move-to-tomorrow'
export const DELETE_INCOMPLETE_ACTION = 'delete-at-end-of-day'

export function getOverdueTaskAction(task, today) {
  if (!task || task.completed || !task.dueDate || task.dueDate >= today) {
    return null
  }

  if (task.incompleteAction === DELETE_INCOMPLETE_ACTION) {
    return { type: 'delete' }
  }

  return { type: 'move', dueDate: today }
}