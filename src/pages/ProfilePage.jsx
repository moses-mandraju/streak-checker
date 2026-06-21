import { LogOut, Mail, Moon, Sun, User } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { logoutUser } from '../firebase/auth'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

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
        description="Your Firebase Authentication profile and app preferences."
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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Toggle theme
            </Button>
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
