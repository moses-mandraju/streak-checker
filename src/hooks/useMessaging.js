import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  getCurrentTimezone,
  getMessagingToken,
  saveDeviceToken,
} from '../firebase/messaging'

export function useMessaging() {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!user || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return
    }

    async function refreshDeviceToken() {
      const token = await getMessagingToken()
      if (!token) {
        throw new Error('This device did not return a push notification token.')
      }
      await saveDeviceToken(user.uid, token)
    }

    refreshDeviceToken().catch((error) => {
      console.warn('Unable to refresh this device notification token:', error)
    })
  }, [user])

  return {
    timezone: getCurrentTimezone(),
  }
}
