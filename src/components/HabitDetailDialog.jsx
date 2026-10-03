import {
  Bell,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Flame,
  Pencil,
  Trash2,
  Trophy,
} from 'lucide-react'
import { addMonths, subMonths } from 'date-fns'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import {
  completeHabit,
  deleteHabit,
  toggleHabitCompletionForDate,
} from '../services/habitService'
import { todayKey, getCurrentStreak, getLongestStreak, calculateStreaksFromHistory } from '../utils/date'
import { playCompletionSound } from '../utils/completionSound'
import { useHabitStore } from '../store/habitStore'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Dialog } from './ui/dialog'
import InteractiveHabitMonth from './InteractiveHabitMonth'
import HabitTypeIcon from './HabitTypeIcon'

const accents = ['#35D399', '#60A5FA', '#A78BFA', '#FBBF24', '#FB7185', '#22D3EE']

function habitAccent(habit) {
  if (habit.color) return habit.color
  return accents[
    (habit.title || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % accents.length
  ]
}

export default function HabitDetailDialog({
  habit,
  userId,
  open,
  onOpenChange,
  onEdit,
  onManageReminder,
  habits = [],
  onNavigate,
}) {
  const [updatingDate, setUpdatingDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [localHabit, setLocalHabit] = useState(habit)
  const [monthDate, setMonthDate] = useState(new Date())
  const updateHabitInStore = useHabitStore((state) => state.updateHabit)

  useEffect(() => {
    setLocalHabit(habit)
    setMonthDate(new Date())
  }, [habit])

  if (!habit || !localHabit) return null

  const activeHabit = localHabit
  const accent = habitAccent(activeHabit)
  const isResistance = activeHabit.category === 'resistance'
  const completedToday = (activeHabit.completionHistory || []).includes(todayKey())
  const currentStreak = getCurrentStreak(activeHabit)
  const longestStreak = getLongestStreak(activeHabit)
  const totalCompletedDays = (activeHabit.completionHistory || []).length
  const habitIndex = habits.findIndex((item) => item.id === activeHabit.id)
  const hasHabitNavigation = habits.length > 1 && habitIndex >= 0

  function navigateHabit(direction) {
    if (!hasHabitNavigation) return
    const nextIndex = (habitIndex + direction + habits.length) % habits.length
    onNavigate?.(habits[nextIndex])
  }

  async function handleComplete() {
    if (busy || completedToday) return

    const previousHabit = activeHabit
    const history = activeHabit.completionHistory || []
    const today = todayKey()
    const nextHistory = history.includes(today)
      ? history
      : [...history, today]
    const optimisticUpdates = calculateStreaksFromHistory(nextHistory)

    // Update the UI immediately. Do not wait for Firestore.
    setLocalHabit((current) => ({ ...current, ...optimisticUpdates }))
    updateHabitInStore(activeHabit.id, optimisticUpdates)
    setBusy(true)

    try {
      await completeHabit(userId, activeHabit)
      playCompletionSound()
      toast.success(isResistance ? 'Resistance logged.' : 'Habit completed.')
    } catch (error) {
      // Roll back the optimistic update if persistence fails.
      setLocalHabit(previousHabit)
      updateHabitInStore(activeHabit.id, {
        completionHistory: previousHabit.completionHistory || [],
        currentStreak: previousHabit.currentStreak || 0,
        longestStreak: previousHabit.longestStreak || 0,
        lastCompletedDate: previousHabit.lastCompletedDate || '',
      })
      toast.error(error?.message || 'Unable to complete habit.')
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleDate(dateKey) {
    if (updatingDate) return

    const previousHabit = activeHabit
    const history = activeHabit.completionHistory || []
    const wasCompleted = history.includes(dateKey)
    const nextHistory = wasCompleted
      ? history.filter((key) => key !== dateKey)
      : [...history, dateKey]
    const optimisticUpdates = calculateStreaksFromHistory(nextHistory)

    // Update the calendar, streak and counters immediately on click.
    setLocalHabit((current) => ({ ...current, ...optimisticUpdates }))
    updateHabitInStore(activeHabit.id, optimisticUpdates)
    setUpdatingDate(dateKey)

    try {
      await toggleHabitCompletionForDate(userId, activeHabit, dateKey)
      if (!wasCompleted) playCompletionSound()
    } catch (error) {
      // Roll back if Firestore rejects the change.
      setLocalHabit(previousHabit)
      updateHabitInStore(activeHabit.id, {
        completionHistory: previousHabit.completionHistory || [],
        currentStreak: previousHabit.currentStreak || 0,
        longestStreak: previousHabit.longestStreak || 0,
        lastCompletedDate: previousHabit.lastCompletedDate || '',
      })
      toast.error(error?.message || 'Unable to update this date.')
    } finally {
      setUpdatingDate('')
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteHabit(userId, activeHabit.id)
      toast.success('Habit deleted.')
      onOpenChange(false)
    } catch (error) {
      toast.error(error?.message || 'Unable to delete habit.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      title={<div className="flex items-center gap-1"><Button aria-label="Previous habit" className="h-8 w-8" disabled={!hasHabitNavigation} size="icon" variant="ghost" onClick={() => navigateHabit(-1)}><ChevronLeft className="h-4 w-4" /></Button><span className="max-w-44 truncate">{activeHabit.title}</span><Button aria-label="Next habit" className="h-8 w-8" disabled={!hasHabitNavigation} size="icon" variant="ghost" onClick={() => navigateHabit(1)}><ChevronRight className="h-4 w-4" /></Button></div>}
      onOpenChange={onOpenChange}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
            style={{
              backgroundColor: `${accent}20`,
              boxShadow: `inset 3px 0 0 ${accent}`,
            }}
          >
            {activeHabit.emoji}
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium" style={{ color: isResistance ? '#FB806F' : '#35D399' }}><HabitTypeIcon resistance={isResistance} className="h-4 w-4" />{isResistance ? 'Resistance' : 'Consistency'}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap any past day to update your history.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat icon={Flame} value={currentStreak} label="Current" accent={accent} />
          <Stat icon={Trophy} value={longestStreak} label="Best" accent={accent} />
          <Stat value={totalCompletedDays} label={isResistance ? 'Successful' : 'Completed'} accent={accent} />
        </div>

        <InteractiveHabitMonth
          habit={activeHabit}
          accent={accent}
          updatingDate={updatingDate}
          onToggleDate={handleToggleDate}
          monthDate={monthDate}
          onPreviousMonth={() => setMonthDate((value) => subMonths(value, 1))}
          onNextMonth={() => setMonthDate((value) => addMonths(value, 1))}
          isResistance={isResistance}
        />

        {currentStreak === 0 && totalCompletedDays > 0 ? (
          <div
            className="rounded-2xl border p-3"
            style={{
              borderColor: `${accent}25`,
              backgroundColor: `${accent}08`,
            }}
          >
            <p className="text-sm font-semibold" style={{ color: accent }}>
              Your streak ended. Your progress didn't.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalCompletedDays} {isResistance ? 'successful' : 'completed'} days are still part of your history.
              Start a new streak today.
            </p>
          </div>
        ) : null}

        {activeHabit.reminderEnabled ? (
          <div className="flex justify-end">
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <BellRing className="h-3.5 w-3.5" />
              {activeHabit.reminderTime}
            </span>
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(activeHabit)}>
              <Pencil className="h-4 w-4" />
              Edit habit
            </Button>
          )}
          {onManageReminder && (
            <Button variant="outline" onClick={() => onManageReminder(activeHabit)}>
              <Bell className="h-4 w-4" />
              <BellRing className="h-4 w-4" />
              Reminder
            </Button>
          )}
          <Button
            className="sm:col-span-2"
            disabled={completedToday || busy}
            variant={completedToday ? 'secondary' : 'default'}
            onClick={handleComplete}
            style={
              completedToday
                ? { borderColor: `${accent}66`, color: accent }
                : { backgroundColor: accent, color: '#071512' }
            }
          >
            {completedToday
              ? isResistance ? 'Resisted today ✓' : 'Completed today ✓'
              : isResistance ? 'Resist today' : 'Complete today'}
          </Button>
          <Button
            className="sm:col-span-2"
            disabled={busy}
            variant="ghost"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="text-destructive">Delete habit</span>
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

function Stat({ icon: Icon, value, label, accent }) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        {Icon ? <Icon className="mx-auto h-4 w-4" style={{ color: accent }} /> : null}
        <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
