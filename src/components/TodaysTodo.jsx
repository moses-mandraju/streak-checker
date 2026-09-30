import { Check, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { createTask, deleteTask, toggleTask } from '../services/taskService'
import { todayKey } from '../utils/date'
import { useAuthStore } from '../store/authStore'
import { useTaskStore } from '../store/taskStore'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'

export default function TodaysTodo() {
  const user = useAuthStore((state) => state.user)
  const tasks = useTaskStore((state) => state.tasks)
  const loading = useTaskStore((state) => state.loading)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const todaysTasks = useMemo(
    () => tasks.filter((task) => task.dueDate === todayKey()),
    [tasks],
  )

  async function handleAdd(event) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    setSaving(true)
    try {
      await createTask(user.uid, trimmed)
      setTitle('')
    } catch (error) {
      toast.error(error?.message || 'Unable to add task.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(task) {
    try {
      await toggleTask(user.uid, task)
    } catch (error) {
      toast.error(error?.message || 'Unable to update task.')
    }
  }

  async function handleDelete(task) {
    try {
      await deleteTask(user.uid, task.id)
    } catch (error) {
      toast.error(error?.message || 'Unable to delete task.')
    }
  }

  return (
    <Card className="mb-6 border-primary/20">
      <CardContent className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Today
            </p>
            <h2 className="mt-1 text-lg font-semibold">Today's to-do</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {todaysTasks.filter((task) => task.completed).length}/{todaysTasks.length} done
          </span>
        </div>

        {loading ? (
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
        ) : todaysTasks.length ? (
          <div className="space-y-2">
            {todaysTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2.5"
              >
                <button
                  type="button"
                  aria-label={task.completed ? 'Mark task incomplete' : 'Complete task'}
                  onClick={() => handleToggle(task)}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
                    task.completed
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-transparent hover:border-primary'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </button>

                <span className={`min-w-0 flex-1 text-sm ${task.completed ? 'text-muted-foreground line-through' : ''}`}>
                  {task.title}
                </span>

                <button
                  type="button"
                  aria-label="Delete task"
                  onClick={() => handleDelete(task)}
                  className="p-1 text-muted-foreground transition hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
            Nothing planned for today.
          </p>
        )}

        <form onSubmit={handleAdd} className="mt-3 flex gap-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task for today..."
            maxLength={120}
          />
          <Button type="submit" disabled={saving || !title.trim()}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
