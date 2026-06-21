import { useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import HabitCard from '../components/HabitCard'
import HabitForm from '../components/HabitForm'
import { Button } from '../components/ui/button'
import { Dialog } from '../components/ui/dialog'
import { createHabit, updateHabit } from '../services/habitService'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'

export default function HabitsPage() {
  const user = useAuthStore((state) => state.user)
  const habits = useHabitStore((state) => state.habits)
  const loading = useHabitStore((state) => state.loading)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function openCreateDialog() {
    setEditingHabit(null)
    setDialogOpen(true)
  }

  function openEditDialog(habit) {
    setEditingHabit(habit)
    setDialogOpen(true)
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

  return (
    <>
      <PageHeader
        eyebrow="Habits"
        title="Manage your habits"
        description="Add as many habits as you want, then complete each one once per day."
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add habit
          </Button>
        }
      />
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <EmptyState onAdd={openCreateDialog} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              userId={user.uid}
              onEdit={() => openEditDialog(habit)}
            />
          ))}
        </div>
      )}
      <Dialog
        open={dialogOpen}
        title={editingHabit ? 'Edit habit' : 'Add habit'}
        onOpenChange={setDialogOpen}
      >
        <HabitForm
          habit={editingHabit}
          submitting={submitting}
          onCancel={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />
      </Dialog>
    </>
  )
}
