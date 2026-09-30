import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Bell, BellOff } from 'lucide-react'
import toast from 'react-hot-toast'

import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import HabitCard from '../components/HabitCard'
import HabitForm from '../components/HabitForm'
import WeekHabitList from '../components/WeekHabitList'
import HabitDetailDialog from '../components/HabitDetailDialog'
import ReminderSettingsModal from '../components/ReminderSettingsModal'
import { Button } from '../components/ui/button'
import { Dialog } from '../components/ui/dialog'
import { Card, CardContent } from '../components/ui/card'

import {
  createHabit,
  updateHabit,
  updateHabitReminder,
  defaultReminderSettings,
} from '../services/habitService'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'

export default function HabitsPage() {
  const user = useAuthStore((state) => state.user)
  const habits = useHabitStore((state) => state.habits)
  const loading = useHabitStore((state) => state.loading)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [detailHabit, setDetailHabit] = useState(null)
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [selectedHabitForReminder, setSelectedHabitForReminder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [habitView, setHabitView] = useState('tick')
  const [expanded, setExpanded] = useState({ consistency: true, resistance: false })

  function openCreateDialog() {
    setEditingHabit(null)
    setDialogOpen(true)
  }

  function openEditDialog(habit) {
    setDetailHabit(null)
    setEditingHabit(habit)
    setDialogOpen(true)
  }

  function openReminderDialog(habit) {
    setSelectedHabitForReminder(habit)
    setReminderDialogOpen(true)
  }

  async function handleSubmit(values) {
    setSubmitting(true)
    try {
      if (editingHabit) {
        await updateHabit(user.uid, editingHabit.id, values)
        toast.success('Habit updated.')
      } else {
        await createHabit(user.uid, values)
        toast.success('Habit added.')
      }
      setDialogOpen(false)
      setEditingHabit(null)
    } catch (error) {
      toast.error(error?.message || 'Unable to save habit.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSaveReminder(reminderSettings) {
    if (!selectedHabitForReminder) return
    setSubmitting(true)
    try {
      await updateHabitReminder(user.uid, selectedHabitForReminder.id, reminderSettings)
      toast.success('Reminder settings saved.')
      setReminderDialogOpen(false)
      setSelectedHabitForReminder(null)
    } catch (error) {
      toast.error(error?.message || 'Unable to save reminder settings.')
    } finally {
      setSubmitting(false)
    }
  }

  const grouped = useMemo(() => ({
    consistency: habits.filter((habit) => (habit.category || 'consistency') === 'consistency'),
    resistance: habits.filter((habit) => habit.category === 'resistance'),
  }), [habits])

  const habitsWithReminder = habits.filter((h) => h.reminderEnabled)
  const habitsWithoutReminder = habits.filter((h) => !h.reminderEnabled)

  return (
    <>
      <PageHeader
        eyebrow="Habits"
        title="Manage your habits"
        description="Build consistency, strengthen resistance, and keep your history."
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add habit
          </Button>
        }
      />

      <div className="mb-6 flex max-w-xs rounded-2xl border border-border bg-secondary/40 p-1" role="tablist" aria-label="Habit view">
        <button type="button" role="tab" aria-selected={habitView === 'tick'} onClick={() => setHabitView('tick')} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${habitView === 'tick' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Tick</button>
        <button type="button" role="tab" aria-selected={habitView === 'week'} onClick={() => setHabitView('week')} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${habitView === 'week' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Week</button>
      </div>

      {habitView === 'week' ? (
        <p className="-mt-3 mb-5 text-sm text-muted-foreground">
          Your habits with their current-week progress.
        </p>
      ) : null}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <EmptyState onAdd={openCreateDialog} />
      ) : (
        <>
          <Card className="mb-6 border-primary/20">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {habitsWithReminder.length} of {habits.length} habits have reminders on
                  </p>
                  {habitsWithoutReminder.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {habitsWithoutReminder.length} habit{habitsWithoutReminder.length > 1 ? 's' : ''} without a reminder
                    </p>
                  )}
                </div>
              </div>
              {habitsWithoutReminder.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => openReminderDialog(habitsWithoutReminder[0])}>
                  <BellOff className="mr-2 h-4 w-4" />
                  Set reminders
                </Button>
              )}
            </CardContent>
          </Card>

          {habitView === 'week' ? (
            <WeekHabitList habits={habits} />
          ) : (
            <div className="space-y-3">
              <HabitCategory
                icon="🌱"
                title="Consistency"
                count={grouped.consistency.length}
                expanded={expanded.consistency}
                onToggle={() => setExpanded((value) => ({ ...value, consistency: !value.consistency }))}
                habits={grouped.consistency}
                onOpenDetails={setDetailHabit}
              />
              <HabitCategory
                icon="🛑"
                title="Resistance"
                count={grouped.resistance.length}
                expanded={expanded.resistance}
                onToggle={() => setExpanded((value) => ({ ...value, resistance: !value.resistance }))}
                habits={grouped.resistance}
                onOpenDetails={setDetailHabit}
              />
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} title={editingHabit ? 'Edit habit' : 'Add habit'} onOpenChange={setDialogOpen}>
        <HabitForm
          habit={editingHabit}
          submitting={submitting}
          onCancel={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />
      </Dialog>

      <HabitDetailDialog
        habit={detailHabit}
        userId={user.uid}
        open={Boolean(detailHabit)}
        onOpenChange={(open) => !open && setDetailHabit(null)}
        onEdit={openEditDialog}
        onManageReminder={openReminderDialog}
      />

      <ReminderSettingsModal
        open={reminderDialogOpen}
        onOpenChange={setReminderDialogOpen}
        reminderSettings={
          selectedHabitForReminder
            ? {
                reminderEnabled: selectedHabitForReminder.reminderEnabled,
                reminderTime: selectedHabitForReminder.reminderTime,
                reminderFrequency: selectedHabitForReminder.reminderFrequency,
                selectedDays: selectedHabitForReminder.selectedDays || [],
                notificationTitle: selectedHabitForReminder.notificationTitle,
                notificationMessage: selectedHabitForReminder.notificationMessage,
              }
            : defaultReminderSettings
        }
        onSave={handleSaveReminder}
      />
    </>
  )
}

function HabitCategory({ icon, title, count, expanded, onToggle, habits, onOpenDetails }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-accent/50"
        aria-expanded={expanded}
      >
        <span className="text-xl">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{title}</span>
          <span className="text-xs text-muted-foreground">
            {count} {count === 1 ? 'habit' : 'habits'}
          </span>
        </span>
        {expanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
      </button>

      {expanded ? (
        <div className="border-t border-border p-3 sm:p-4">
          {habits.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No {title.toLowerCase()} habits yet.
            </p>
          )}
        </div>
      ) : null}
    </section>
  )
}
