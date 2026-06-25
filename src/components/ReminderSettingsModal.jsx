import { useEffect, useState } from 'react'
import { Dialog, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { TimePicker } from './TimePicker'
import { DaySelector } from './DaySelector'

const frequencies = ['Daily', 'Weekly', 'Custom']

export default function ReminderSettingsModal({
  open,
  onOpenChange,
  reminderSettings,
  onSave,
}) {
  const [reminderEnabled, setReminderEnabled] = useState(
    reminderSettings.reminderEnabled ?? false,
  )
  const [reminderTime, setReminderTime] = useState(
    reminderSettings.reminderTime || '09:00',
  )
  const [reminderFrequency, setReminderFrequency] = useState(
    reminderSettings.reminderFrequency || 'Daily',
  )
  const [selectedDays, setSelectedDays] = useState(
    reminderSettings.selectedDays || [],
  )
  const [notificationTitle, setNotificationTitle] = useState(
    reminderSettings.notificationTitle || '',
  )
  const [notificationMessage, setNotificationMessage] = useState(
    reminderSettings.notificationMessage || '',
  )

  useEffect(() => {
    setReminderEnabled(reminderSettings.reminderEnabled ?? false)
    setReminderTime(reminderSettings.reminderTime || '09:00')
    setReminderFrequency(reminderSettings.reminderFrequency || 'Daily')
    setSelectedDays(reminderSettings.selectedDays || [])
    setNotificationTitle(reminderSettings.notificationTitle || '')
    setNotificationMessage(reminderSettings.notificationMessage || '')
  }, [reminderSettings, open])

  function handleSave() {
    onSave({
      reminderEnabled,
      reminderTime,
      reminderFrequency,
      selectedDays,
      notificationTitle,
      notificationMessage,
    })
    onOpenChange(false)
  }

  const showDaySelector = reminderFrequency !== 'Daily'
  const isEnabled = reminderEnabled

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Reminder settings">
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(event) => setReminderEnabled(event.target.checked)}
          />
          Enable reminders for this habit
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <TimePicker
            value={reminderTime}
            onChange={setReminderTime}
            disabled={!isEnabled}
          />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Frequency</span>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={!isEnabled}
              value={reminderFrequency}
              onChange={(event) => setReminderFrequency(event.target.value)}
            >
              {frequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency}
                </option>
              ))}
            </select>
          </label>
        </div>

        {showDaySelector ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {reminderFrequency === 'Weekly'
                ? 'Pick reminder days for weekly reminders'
                : 'Pick reminder days for custom reminders'}
            </p>
            <DaySelector
              selectedDays={selectedDays}
              onChange={setSelectedDays}
              disabled={!isEnabled}
            />
          </div>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Notification title</span>
          <Input
            disabled={!isEnabled}
            value={notificationTitle}
            onChange={(event) => setNotificationTitle(event.target.value)}
            placeholder="Your habit reminder"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Notification message</span>
          <Input
            disabled={!isEnabled}
            value={notificationMessage}
            onChange={(event) => setNotificationMessage(event.target.value)}
            placeholder="Time to complete your habit"
          />
        </label>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save reminder
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
