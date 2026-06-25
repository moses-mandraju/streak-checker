import { NavLink, Outlet } from 'react-router-dom'
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Flame,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  User,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { logoutUser } from '../firebase/auth'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useHabits } from '../hooks/useHabits'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { Button } from '../components/ui/button'
import { cn } from '../utils/cn'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/habits', label: 'Habits', icon: CheckCircle2 },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/statistics', label: 'Stats', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function AppLayout() {
  const user = useAuthStore((state) => state.user)
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const { canInstall, promptInstall } = usePwaInstall()
  useHabits(user?.uid)

  async function handleLogout() {
    sessionStorage.removeItem('installBannerDismissed')

    try {
      await logoutUser()
      toast.success('Logged out.')
    } catch (error) {
      toast.error(error?.message || 'Unable to log out.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-2 py-2 backdrop-blur md:inset-y-0 md:left-0 md:right-auto md:w-64 md:border-r md:border-t-0 md:px-4 md:py-5">
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold leading-tight">Streak Checker</p>
            <p className="text-xs text-muted-foreground">Daily habit tracker</p>
          </div>
        </div>
        <nav className="grid grid-cols-5 gap-1 md:mt-8 md:flex md:flex-col md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground md:flex-row md:justify-start md:gap-3 md:px-3 md:text-sm',
                  isActive &&
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                )
              }
              end={item.to === '/'}
              to={item.to}
            >
              <item.icon className="h-5 w-5 md:h-4 md:w-4" />
              <span className="mt-1 md:mt-0">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 hidden border-t pt-4 md:block">
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted p-3">
            <img
              alt={user?.displayName || 'User'}
              className="h-9 w-9 rounded-full object-cover"
              src={user?.photoURL || 'https://www.gravatar.com/avatar/?d=mp'}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {canInstall && (
              <Button className="w-full" variant="default" onClick={promptInstall}>
                Install Streak
              </Button>
            )}
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                Theme
              </Button>
              <Button aria-label="Logout" size="icon" variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-6 md:ml-64 md:px-8 md:pb-10">
        <Outlet />
      </main>
    </div>
  )
}
