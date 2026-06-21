import { Navigate } from 'react-router-dom'
import { CheckCircle2, Flame, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { signInWithGoogle } from '../firebase/auth'
import { isFirebaseConfigured } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'

export default function LoginPage() {
  const { user } = useAuth()

  if (user) return <Navigate to="/" replace />

  async function handleLogin() {
    try {
      await signInWithGoogle()
      toast.success('Welcome to Streak Checker.')
    } catch (error) {
      toast.error(error?.message || 'Google sign in failed.')
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-lg border bg-card shadow-xl md:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-between bg-primary p-8 text-primary-foreground md:p-10">
            <div>
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-white/15">
                <Flame className="h-7 w-7" />
              </div>
              <h1 className="max-w-xl text-4xl font-semibold tracking-normal md:text-5xl">
                Streak Checker
              </h1>
              <p className="mt-4 max-w-lg text-base text-primary-foreground/80">
                Track daily habits, protect your streaks, and see your progress without clutter.
              </p>
            </div>
            <div className="mt-10 grid gap-3 text-sm text-primary-foreground/85 sm:grid-cols-3">
              {['One-tap completion', 'Monthly calendar', 'Live statistics'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {item}
                </div>
              ))}
            </div>
          </section>
          <section className="p-8 md:p-10">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <div className="mb-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-normal">Welcome back</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sign in with Google to sync your habits with Firebase.
                  </p>
                </div>
                <Button
                  className="w-full"
                  disabled={!isFirebaseConfigured}
                  onClick={handleLogin}
                >
                  {isFirebaseConfigured ? 'Continue with Google' : 'Firebase setup required'}
                </Button>
                {!isFirebaseConfigured ? (
                  <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                    Add your Firebase credentials to the project environment to enable sign-in.
                  </p>
                ) : null}
                <p className="mt-6 text-xs leading-5 text-muted-foreground">
                  Your session is persisted locally by Firebase Authentication.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
