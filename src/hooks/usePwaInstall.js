import { useEffect, useState } from 'react'

export function usePwaInstall() {
  const [promptEvent, setPromptEvent] = useState(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setPromptEvent(event)
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  async function promptInstall() {
    if (!promptEvent) {
      return
    }

    promptEvent.prompt()
    const choice = await promptEvent.userChoice

    setCanInstall(false)
    setPromptEvent(null)

    return choice
  }

  return {
    canInstall,
    promptInstall,
  }
}
