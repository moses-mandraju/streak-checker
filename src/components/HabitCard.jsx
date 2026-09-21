import {
  Bell,
  BellRing,
  Flame,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

import {
  completeHabit,
  deleteHabit,
  toggleHabitCompletionForDate,
} from '../services/habitService'

import { todayKey } from '../utils/date'

import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import InteractiveHabitMonth from './InteractiveHabitMonth'

const accents = [
  '#35D399',
  '#60A5FA',
  '#A78BFA',
  '#FBBF24',
  '#FB7185',
  '#22D3EE',
]

const habitAccent = (habit) =>
  habit.color ||
  accents[
    (habit.title || '')
      .split('')
      .reduce(
        (sum, char) =>
          sum + char.charCodeAt(0),
        0,
      ) % accents.length
  ]

export default function HabitCard({
  habit,
  userId,
  onEdit,
  onManageReminder,
}) {
  const completedToday =
    (habit.completionHistory || []).includes(
      todayKey(),
    )

  const isResistance =
    habit.category === 'resistance'

  const totalCompletedDays =
    (habit.completionHistory || []).length

  const accent = habitAccent(habit)

  const [updatingDate, setUpdatingDate] =
    useState('')

  async function handleComplete() {
    try {
      await completeHabit(userId, habit)

      toast.success('Habit completed.')
    } catch (error) {
      toast.error(
        error?.message ||
          'Unable to complete habit.',
      )
    }
  }

  async function handleDelete() {
    try {
      await deleteHabit(
        userId,
        habit.id,
      )

      toast.success('Habit deleted.')
    } catch (error) {
      toast.error(
        error?.message ||
          'Unable to delete habit.',
      )
    }
  }

  async function handleToggleDate(dateKey) {
    setUpdatingDate(dateKey)

    try {
      await toggleHabitCompletionForDate(
        userId,
        habit,
        dateKey,
      )
    } catch (error) {
      toast.error(
        error?.message ||
          'Unable to update this date.',
      )
    } finally {
      setUpdatingDate('')
    }
  }

  return (
    <Card className="group overflow-hidden hover:-translate-y-0.5 hover:border-primary/30">
      <CardContent className="p-5 sm:p-6">

        {/* Habit header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">

            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
              style={{
                backgroundColor: `${accent}26`,
                boxShadow: `0 0 22px ${accent}2B, inset 3px 0 0 ${accent}`,
              }}
            >
              {habit.emoji}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground">
                {habit.title}
              </h3>

              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Flame
                  className="h-3.5 w-3.5"
                  style={{
                    color: accent,
                  }}
                />

                {habit.currentStreak || 0}{' '}
                day streak
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {onEdit ? (
              <Button
                aria-label="Edit habit"
                size="icon"
                variant="ghost"
                onClick={onEdit}
              >
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

        {/* Monthly history */}
        <InteractiveHabitMonth
          habit={habit}
          accent={accent}
          updatingDate={updatingDate}
          onToggleDate={handleToggleDate}
        />

        {/* Simple habit progress */}
        <div className="mt-5 border-t border-border pt-4">
          <p
            className="text-lg font-semibold tabular-nums"
            style={{ color: accent }}
          >
            {totalCompletedDays}{' '}
            {isResistance
              ? 'successful days'
              : 'completed days'}
          </p>
        </div>

        {/* Reminder */}
        {habit.reminderEnabled ? (
          <div className="mt-4 flex justify-end">
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <BellRing className="h-3.5 w-3.5" />
              {habit.reminderTime}
            </span>
          </div>
        ) : null}

        {/* Actions */}
        <div className="mt-5 grid gap-2">
          {onManageReminder ? (
            <Button
              className="w-full"
              variant="outline"
              onClick={() =>
                onManageReminder(habit)
              }
            >
              <Bell className="h-4 w-4" />
              Manage reminder
            </Button>
          ) : null}

          <Button
            className={
              completedToday
                ? 'completion-pop w-full'
                : 'w-full'
            }
            disabled={completedToday}
            variant={
              completedToday
                ? 'secondary'
                : 'default'
            }
            onClick={handleComplete}
            style={
              completedToday
                ? {
                    borderColor: `${accent}66`,
                    color: accent,
                  }
                : {
                    backgroundColor: accent,
                    color: '#071512',
                  }
            }
          >
            {completedToday
              ? 'Completed today ✓'
              : 'Complete today'}
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}