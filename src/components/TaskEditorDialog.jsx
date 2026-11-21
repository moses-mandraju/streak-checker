import { useState } from 'react'
import toast from 'react-hot-toast'
import { createTask, updateTask } from '../services/taskService'
import { todayKey } from '../utils/date'
import { validateTaskDetails } from '../utils/task-planner'
import { Button } from './ui/button'
import { Dialog } from './ui/dialog'
import { Input } from './ui/input'

const reminderChoices = [
  { value: 0, label: 'At start time' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '60 minutes before' },
]

function getInitialValues(task, selectedDate) {
  return {
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate || selectedDate,
    startTime: task?.startTime || '',
    endTime: task?.endTime || '',
    allDay: Boolean(task?.allDay),
    carryForward: Boolean(task?.carryForward),
    notificationEnabled: Boolean(task?.notificationEnabled),
    reminderMinutesBefore: Number(task?.reminderMinutesBefore) || 0,
    timezone: task?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  }
}

export default function TaskEditorDialog({
  open,
  onOpenChange,
  task,
  selectedDate,
  userId,
}) {
  const [values, setValues] = useState(() => getInitialValues(task, selectedDate))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateTaskDetails(values, {
      allowPastDate: Boolean(task && values.dueDate === task.dueDate),
    })
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    try {
      if (task) {
        await updateTask(
          userId,
          task.id,
          {
            ...values,
            completed: task.completed,
          },
          task.dueDate,
        )
      } else {
        await createTask(userId, values)
        setValues(getInitialValues(null, selectedDate))
      }
      onOpenChange(false)
    } catch (saveError) {
      toast.error(saveError?.message || 'Unable to save task.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      title={task ? 'Edit task' : 'Schedule a task'}
      onOpenChange={onOpenChange}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Title">
          <Input
            autoFocus
            required
            maxLength={120}
            value={values.title}
            onChange={(event) => updateValue('title', event.target.value)}
            placeholder="What needs to get done?"
          />
        </Field>

        <Field label="Description" optional>
          <textarea
            rows={2}
            maxLength={1000}
            value={values.description}
            onChange={(event) => updateValue('description', event.target.value)}
            placeholder="Add a note (optional)"
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>

        <Field label="Date">
          <Input
            type="date"
            required
            min={
              task && task.dueDate < todayKey() &&
                values.dueDate === task.dueDate
                ? task.dueDate
                : todayKey()
            }
            value={values.dueDate}
            onChange={(event) => updateValue('dueDate', event.target.value)}
          />
        </Field>

        <label className="flex items-start gap-2 rounded-xl border border-border bg-background/50 p-3 text-sm">
          <input
            type="checkbox"
            checked={values.carryForward}
            onChange={(event) => updateValue('carryForward', event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          <span>
            <span className="block font-medium">Move to the next day if not completed</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              When enabled, an unfinished task moves forward each day in your time zone until completed.
            </span>
          </span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.allDay}
            onChange={(event) => setValues((current) => ({
              ...current,
              allDay: event.target.checked,
              startTime: event.target.checked ? '' : current.startTime,
              endTime: event.target.checked ? '' : current.endTime,
              notificationEnabled: event.target.checked
                ? current.notificationEnabled
                : Boolean(current.startTime && current.notificationEnabled),
            }))}
            className="h-4 w-4 accent-primary"
          />
          All day
        </label>

        {!values.allDay ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time" optional>
              <Input
                type="time"
                value={values.startTime}
                onChange={(event) => setValues((current) => ({
                  ...current,
                  startTime: event.target.value,
                  notificationEnabled: event.target.value || current.allDay
                    ? current.notificationEnabled
                    : false,
                }))}
              />
            </Field>
            <Field label="End time" optional>
              <Input
                type="time"
                value={values.endTime}
                onChange={(event) => updateValue('endTime', event.target.value)}
              />
            </Field>
          </div>
        ) : null}

        <div className="rounded-xl border border-border bg-background/50 p-3">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.notificationEnabled}
              disabled={!values.allDay && !values.startTime}
              onChange={(event) => updateValue('notificationEnabled', event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span>
              <span className="block font-medium">Task reminder</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {values.allDay
                  ? 'All-day task reminders use 9:00 AM in your time zone.'
                  : 'Sent to your registered devices in your time zone.'}
              </span>
            </span>
          </label>
          {values.notificationEnabled ? (
            <label className="mt-3 block text-xs text-muted-foreground">
              Remind me
              <select
                value={values.reminderMinutesBefore}
                onChange={(event) => updateValue('reminderMinutesBefore', Number(event.target.value))}
                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                {reminderChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>{choice.label}</option>
                ))}
              </select>
            </label>
          ) : null}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Time zone: {values.timezone}
          </p>
        </div>

        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

function Field({ label, optional = false, children }) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      <span>{label}{optional ? <span className="ml-1 text-xs font-normal text-muted-foreground">optional</span> : null}</span>
      {children}
    </label>
  )
}
