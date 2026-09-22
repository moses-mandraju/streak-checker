import { LogOut, Mail, User, Volume2, VolumeX } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { logoutUser } from '../firebase/auth'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import ThemeSelector from '../components/ThemeSelector'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const soundEnabled = useSettingsStore((state) => state.soundEnabled)
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled)

  async function handleLogout() {
    try {
      await logoutUser()
      toast.success('Logged out.')
    } catch (error) {
      toast.error(error?.message || 'Unable to log out.')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="Account"
        description="Your account and Habitly preferences."
      />
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              alt={user?.displayName || 'User profile'}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/10"
              src={user?.photoURL || 'https://www.gravatar.com/avatar/?d=mp'}
            />
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xl font-semibold">
                <User className="h-5 w-5 text-primary" />
                {user?.displayName}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6">
            <p className="mb-3 text-sm font-semibold">Appearance</p>
            <ThemeSelector />

            <div className="mt-6 border-t border-border pt-6">
              <p className="mb-3 text-sm font-semibold">Sounds</p>
              <button
                type="button"
                aria-pressed={soundEnabled}
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-secondary/30 p-3 text-left transition hover:bg-secondary/50"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">Completion sound</span>
                    <span className="mt-1 block text-xs text-muted-foreground">Play a short sound when a habit is ticked complete.</span>
                  </span>
                </span>
                <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${soundEnabled ? 'bg-primary' : 'bg-muted'}`}>
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </span>
              </button>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
