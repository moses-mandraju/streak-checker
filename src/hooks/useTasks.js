import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { subscribeToTasks } from '../firebase/firestore'
import { reconcileOverdueTask } from '../services/taskService'
import { useTaskStore } from '../store/taskStore'
import { todayKey } from '../utils/date'
import { getOverdueTaskAction } from '../utils/task-lifecycle'

export function useTasks(userId) {
  const { tasks, loading, setTasks, setLoading, resetTasks } = useTaskStore()

  useEffect(() => {
    if (!userId) {
      resetTasks()
      return undefined
    }

    setLoading(true)
    const handledTaskIds = new Set()

    const unsubscribe = subscribeToTasks(
      userId,
      (receivedTasks) => {
        const today = todayKey()
        const visibleTasks = receivedTasks
          .filter((task) => getOverdueTaskAction(task, today)?.type !== 'delete')
          .map((task) => {
            const action = getOverdueTaskAction(task, today)
            return action?.type === 'move'
              ? { ...task, dueDate: action.dueDate }
              : task
          })

        setTasks(visibleTasks)

        receivedTasks.forEach((task) => {
          if (!getOverdueTaskAction(task, today) || handledTaskIds.has(task.id)) return
          handledTaskIds.add(task.id)
          reconcileOverdueTask(userId, task, today).catch((error) => {
            console.error('Unable to reconcile overdue task:', error)
          })
        })
      },
      (error) => {
        setLoading(false)
        toast.error(error?.message || 'Unable to load tasks.')
      },
    )

    return () => {
      handledTaskIds.clear()
      unsubscribe()
    }
  }, [resetTasks, setTasks, setLoading, userId])

  return { tasks, loading }
}
