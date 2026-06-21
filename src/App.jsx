import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import HabitsPage from './pages/HabitsPage'
import CalendarPage from './pages/CalendarPage'
import StatisticsPage from './pages/StatisticsPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import { useTheme } from './hooks/useTheme'

function App() {
  useTheme()

  return (
    <>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            'border border-border bg-card text-card-foreground shadow-lg',
        }}
      />
    </>
  )
}

export default App
