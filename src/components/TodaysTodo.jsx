import { CalendarClock, Check, ChevronDown, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import {
  createTask,
  deleteTask,
  moveTaskToTomorrow,
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
  const pendingTasks = todaysTasks.filter((task) => !task.completed)
  const completedTasks = todaysTasks.filter((task) => task.completed)
  const completionPercent = todaysTasks.length
    ? Math.round((completedTasks.length / todaysTasks.length) * 100)
    : 0

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

  async function handleMoveToTomorrow(task) {
    try {
      await moveTaskToTomorrow(user.uid, task.id)
    } catch (error) {
      toast.error(error?.message || 'Unable to move task.')
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
    <div className="space-y-5">
      <Card className="overflow-hidden border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Daily progress
              </p>
              <h2 className="mt-1 text-xl font-semibold">Today's focus</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {completedTasks.length} of {todaysTasks.length} tasks completed
              </p>
            </div>
            <span className="rounded-2xl bg-primary/10 px-3 py-2 text-lg font-semibold tabular-nums text-primary">
              {completionPercent}%
            </span>
          </div>
          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-label="Today's task completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completionPercent}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:p-4">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What would you like to get done?"
          aria-label="New task"
          maxLength={120}
          className="h-11 flex-1 bg-background/60"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">If unfinished:</span>
            <TaskPolicyDropdown
              ariaLabel="If not completed today"
              value={incompleteAction}
              onChange={setIncompleteAction}
              compact
            />
          </div>
          <Button type="submit" disabled={saving || !title.trim()}>
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <TaskSection
            title="Pending"
            count={pendingTasks.length}
            tasks={pendingTasks}
            emptyMessage="You're all caught up. Add a task whenever you're ready."
            onToggle={handleToggle}
            onDelete={handleDelete}
            onMoveToTomorrow={handleMoveToTomorrow}
            onActionChange={handleIncompleteActionChange}
          />
          <TaskSection
            title="Completed"
            count={completedTasks.length}
            tasks={completedTasks}
            emptyMessage="Completed tasks will appear here."
            onToggle={handleToggle}
            onDelete={handleDelete}
            onMoveToTomorrow={handleMoveToTomorrow}
            onActionChange={handleIncompleteActionChange}
          />
        </div>
      )}
    </div>
  )
}

function TaskSection({
  title,
  count,
  tasks,
  emptyMessage,
  onToggle,
  onDelete,
  onMoveToTomorrow,
  onActionChange,
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/70 p-4 sm:p-5" aria-label={`${title} tasks`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">{count}</span>
      </div>
      {tasks.length ? (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onMoveToTomorrow={onMoveToTomorrow}
              onActionChange={onActionChange}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-3 py-5 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      )}
    </section>
  )
}

function TaskRow({ task, onToggle, onDelete, onMoveToTomorrow, onActionChange }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  function runAction(action) {
    setMenuOpen(false)
    action(task)
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-background/50 px-3 py-2.5 transition-colors hover:border-primary/20">
      <button
        type="button"
        aria-label={task.completed ? 'Mark task incomplete' : 'Complete task'}
        aria-pressed={task.completed}
        onClick={() => onToggle(task)}
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
          task.completed
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border text-transparent hover:border-primary'
        }`}
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <span className={`min-w-0 flex-1 break-words text-sm ${task.completed ? 'text-muted-foreground line-through' : ''}`}>
        {task.title}
      </span>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          aria-label={`Actions for ${task.title}`}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
        {menuOpen ? (
          <div className="absolute right-0 top-full z-30 mt-1.5 w-64 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl">
            {!task.completed ? (
              <>
                <button
                  type="button"
                  onClick={() => runAction(onMoveToTomorrow)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-accent"
                >
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Move to tomorrow
                </button>
                <div className="border-t border-border px-1 py-2">
                  <p className="mb-1 px-1 text-[11px] font-medium text-muted-foreground">If unfinished today</p>
                  <TaskPolicyDropdown
                    ariaLabel={`If not completed today: ${task.title}`}
                    value={task.incompleteAction || DEFAULT_INCOMPLETE_ACTION}
                    onChange={(value) => onActionChange(task, value)}
                    compact
                  />
                </div>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => runAction(onDelete)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete task
            </button>
          </div>
        ) : null}
      </div>
    </li>
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
