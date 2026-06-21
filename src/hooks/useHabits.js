import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { subscribeToHabits } from '../firebase/firestore'
import { useHabitStore } from '../store/habitStore'

export function useHabits(userId) {
  const { habits, loading, setHabits, setLoading, resetHabits } = useHabitStore()

  useEffect(() => {
    if (!userId) {
      resetHabits()
      return undefined
    }

    setLoading(true)
    const unsubscribe = subscribeToHabits(
      userId,
      setHabits,
      (error) => {
        setLoading(false)
        toast.error(error?.message || 'Unable to load habits.')
      },
    )

    return unsubscribe
  }, [resetHabits, setHabits, setLoading, userId])

  return { habits, loading }
}
