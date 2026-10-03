import { CalendarClock, Check, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import {
  createTask,
  deleteTask,
  setTaskIncompleteAction,
  toggleTask,
} from '../services/taskService'
import { todayKey } from '../utils/date'
import { DEFAULT_INCOMPLETE_ACTION } from '../utils/task-lifecycle'
import { useAuthStore } from '../store/authStore'
import { useTaskStore } from '../store/taskStore'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'

const taskPolicies = [
  {
    value: 'move-to-tomorrow',
    label: 'Move to tomorrow',
    description: 'Keep it on your list for the next day.',
    Icon: CalendarClock,
  },
  {
    value: 'delete-at-end-of-day',
    label: 'Delete at end of day',
    description: 'Remove it if it is still incomplete.',
    Icon: Trash2,
  },
]

export default function TodaysTodo() {
  const user = useAuthStore((state) => state.user)
  const tasks = useTaskStore((state) => state.tasks)
  const loading = useTaskStore((state) => state.loading)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [incompleteAction, setIncompleteAction] = useState(DEFAULT_INCOMPLETE_ACTION)

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
      await createTask(user.uid, trimmed, incompleteAction)
      setTitle('')
      setIncompleteAction(DEFAULT_INCOMPLETE_ACTION)
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

  async function handleIncompleteActionChange(task, value) {
    try {
      await setTaskIncompleteAction(user.uid, task.id, value)
    } catch (error) {
      toast.error(error?.message || 'Unable to update task settings.')
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

                <div className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${task.completed ? 'text-muted-foreground line-through' : ''}`}>
                    {task.title}
                  </span>
                  {!task.completed ? (
                    <TaskPolicyDropdown
                      ariaLabel={`If not completed today: ${task.title}`}
                      value={task.incompleteAction || DEFAULT_INCOMPLETE_ACTION}
                      onChange={(value) => handleIncompleteActionChange(task, value)}
                      compact
                    />
                  ) : null}
                </div>

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

        <form onSubmit={handleAdd} className="mt-3 space-y-2">
          <div className="flex gap-2">
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
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>If not completed today:</span>
            <TaskPolicyDropdown
              ariaLabel="If not completed today"
              value={incompleteAction}
              onChange={setIncompleteAction}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function TaskPolicyDropdown({ value, onChange, ariaLabel, compact = false }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const selectedPolicy = taskPolicies.find((policy) => policy.value === value) || taskPolicies[0]
  const SelectedIcon = selectedPolicy.Icon

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const selectedIndex = taskPolicies.findIndex((policy) => policy.value === selectedPolicy.value)
    optionRefs.current[selectedIndex]?.focus()
  }, [open, selectedPolicy.value])

  function focusOption(index) {
    const nextIndex = (index + taskPolicies.length) % taskPolicies.length
    optionRefs.current[nextIndex]?.focus()
  }

  function handleTriggerKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
    }
  }

  function handleOptionKeyDown(event, index) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusOption(index + (event.key === 'ArrowDown' ? 1 : -1))
    }
  }

  function choosePolicy(policy) {
    onChange(policy.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="relative inline-flex max-w-full" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onKeyDown={handleTriggerKeyDown}
        onClick={() => setOpen((current) => !current)}
        className={`group inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-secondary/60 text-left text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}`}
      >
        <span className={`grid shrink-0 place-items-center rounded-md bg-primary/10 text-primary ${compact ? 'h-6 w-6' : 'h-7 w-7'}`}>
          <SelectedIcon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </span>
        <span className="truncate">{selectedPolicy.label}</span>
        <ChevronDown className={`shrink-0 text-muted-foreground transition-transform ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-full z-50 mt-1.5 w-64 max-w-[calc(100vw-3rem)] rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl ring-1 ring-black/10"
          role="menu"
          aria-label={ariaLabel}
        >
          {taskPolicies.map((policy, index) => {
            const Icon = policy.Icon
            const selected = policy.value === selectedPolicy.value

            return (
              <button
                key={policy.value}
                ref={(element) => { optionRefs.current[index] = element }}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                onClick={() => choosePolicy(policy)}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'bg-primary/10' : 'hover:bg-accent'}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${selected ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{policy.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{policy.description}</span>
                </span>
                {selected ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
