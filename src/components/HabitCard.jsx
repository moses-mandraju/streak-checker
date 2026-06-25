import { Bell, CalendarCheck, Flame, Pencil, Trash2, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { completeHabit, deleteHabit } from '../services/habitService'
import { formatDate, todayKey } from '../utils/date'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import ReminderCard from './ReminderCard'

export default function HabitCard({ habit, userId, onEdit, onManageReminder }) {
  const completedToday = (habit.completionHistory || []).includes(todayKey())

  async function handleComplete() {
    try {
      await completeHabit(userId, habit)
      toast.success('Habit completed.')
    } catch (error) {
      toast.error(error?.message || 'Unable to complete habit.')
    }
  }

  async function handleDelete() {
    try {
      await deleteHabit(userId, habit.id)
      toast.success('Habit deleted.')
    } catch (error) {
      toast.error(error?.message || 'Unable to delete habit.')
    }
  }

  return (
    <Card className="group hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-2xl">
              {habit.emoji}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground">
                {habit.title}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <CalendarCheck className="h-4 w-4" />
                Last completed: {formatDate(habit.lastCompletedDate)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {onEdit ? (
              <Button aria-label="Edit habit" size="icon" variant="ghost" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}
            <Button
              aria-label="Delete habit"
              size="icon"
              variant="ghost"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Flame className="h-3.5 w-3.5" />
                Current
              </p>
              <p className="mt-1 text-xl font-semibold">{habit.currentStreak || 0} days</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy className="h-3.5 w-3.5" />
                Longest
              </p>
              <p className="mt-1 text-xl font-semibold">{habit.longestStreak || 0} days</p>
            </div>
          </div>
          <div>
            <ReminderCard reminder={habit} />
          </div>
          {onManageReminder ? (
            <Button
              className="mt-2 w-full"
              variant="outline"
              onClick={() => onManageReminder(habit)}
            >
              <Bell className="h-4 w-4" />
              Manage reminder
            </Button>
          ) : null}
          <Button
            className="w-full"
            disabled={completedToday}
            variant={completedToday ? 'secondary' : 'default'}
            onClick={handleComplete}
          >
            {completedToday ? 'Completed today' : 'Complete Today'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
