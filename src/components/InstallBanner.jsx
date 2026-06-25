import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { Button } from './ui/button'

const INSTALL_DISMISSED_KEY = 'installBannerDismissed'

export default function InstallBanner() {
  const { canInstall, promptInstall } = usePwaInstall()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(INSTALL_DISMISSED_KEY)
    setDismissed(stored === 'true')
  }, [])

  function closeBanner() {
    setDismissed(true)
    sessionStorage.setItem(INSTALL_DISMISSED_KEY, 'true')
  }

  async function handleInstall() {
    console.log('Install button clicked', { canInstall })

    if (canInstall) {
      await promptInstall()
      return
    }

    console.log('Native install prompt not available, showing fallback instructions')
    toast(
      'Use your browser menu and select Add to Home screen to install the app.',
      {
        duration: 7000,
      },
    )
  }

  if (dismissed) return null

  return (
    <div className="mb-6 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-4 text-white shadow-md sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Download className="mt-1 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Install Streak Checker</p>
            <p className="text-sm opacity-90">
              {canInstall
                ? 'Add the app to your home screen for quick access.'
                : 'Install the app from your browser menu for faster access.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            className="bg-white text-emerald-600 hover:bg-gray-100"
            onClick={handleInstall}
          >
            Install
          </Button>
          <button
            type="button"
            onClick={closeBanner}
            className="rounded p-1 text-white transition hover:bg-emerald-700"
            aria-label="Dismiss install banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {!canInstall && (
        <p className="mt-3 text-sm opacity-90">
          If the native prompt is unavailable, use your browser menu and choose Add to Home screen.
        </p>
      )}
    </div>
  )
}
