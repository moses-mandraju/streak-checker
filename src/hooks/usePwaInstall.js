import { useEffect, useState } from 'react'

export function usePwaInstall() {
  const [promptEvent, setPromptEvent] = useState(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      console.log('PWA beforeinstallprompt event fired', event)
      event.preventDefault()
      setPromptEvent(event)
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  async function promptInstall() {
    if (!promptEvent) {
      console.log('PWA promptInstall called but no promptEvent available')
      return
    }

    promptEvent.prompt()
    const choice = await promptEvent.userChoice

    console.log('PWA install choice', choice)
    setCanInstall(false)
    setPromptEvent(null)

    return choice
  }

  return {
    canInstall,
    promptInstall,
  }
}
