import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { observeAuth } from '../firebase/auth'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, loading, setUser } = useAuthStore()

  useEffect(() => {
    const unsubscribe = observeAuth((currentUser) => {
      setUser(currentUser)
    })

    return unsubscribe
  }, [setUser])

  return { user, loading }
}

export function handleAuthError(error) {
  toast.error(error?.message || 'Authentication failed.')
}
