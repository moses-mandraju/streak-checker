import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { subscribeToTasks } from '../firebase/firestore'
import { useTaskStore } from '../store/taskStore'

export function useTasks(userId) {
  const { tasks, loading, setTasks, setLoading, resetTasks } = useTaskStore()

  useEffect(() => {
    if (!userId) {
      resetTasks()
      return undefined
    }

    setLoading(true)

    const unsubscribe = subscribeToTasks(
      userId,
      setTasks,
      (error) => {
        setLoading(false)
        toast.error(error?.message || 'Unable to load tasks.')
      },
    )

    return unsubscribe
  }, [resetTasks, setTasks, setLoading, userId])

  return { tasks, loading }
}
