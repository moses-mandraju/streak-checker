import { Download, X } from 'lucide-react'
import { useState } from 'react'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { Button } from './ui/button'

export default function InstallBanner() {
  const { canInstall, promptInstall } = usePwaInstall()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div className="mb-6 flex items-center justify-between rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-4 text-white shadow-md sm:px-6">
      <div className="flex items-center gap-3">
        <Download className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-medium">Install Streak Checker</p>
          <p className="text-sm opacity-90">Add the app to your home screen for quick access</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="default"
          className="bg-white text-emerald-600 hover:bg-gray-100"
          onClick={promptInstall}
        >
          Install
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1 hover:bg-emerald-700"
          aria-label="Dismiss install banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
