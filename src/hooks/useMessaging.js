import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { getCurrentTimezone, requestNotificationPermission, saveDeviceToken, getMessagingToken } from '../firebase/messaging'

export function useMessaging() {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    async function initializeMessaging() {
      if (!user) {
        return
      }

      try {
        await requestNotificationPermission()
        const token = await getMessagingToken()
        if (token) {
          await saveDeviceToken(user.uid, token)
          toast.success('Push notifications enabled for this device.')
          console.log('FCM token saved for user:', user.uid, token)
        }
      } catch (error) {
        const message = error?.message || 'Unknown notification setup error.'
        toast.error(`Notification setup failed: ${message}`)
        console.warn('Notification setup failed:', error)
      }
    }

    initializeMessaging()
  }, [user])

  return {
    timezone: getCurrentTimezone(),
  }
}
