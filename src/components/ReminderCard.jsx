import { BellRing } from 'lucide-react'
import { Card, CardContent } from './ui/card'

export default function ReminderCard({ reminder }) {
  if (!reminder?.reminderEnabled) {
    return (
      <Card className="rounded-lg border-dashed border-muted p-4">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Reminder disabled
        </CardContent>
      </Card>
    )
  }

  const frequencyLabel =
    reminder.reminderFrequency === 'Daily'
      ? 'Daily'
      : reminder.reminderFrequency === 'Weekly'
      ? 'Weekly'
      : 'Custom'

  const selectedDays = reminder.selectedDays?.length
    ? reminder.selectedDays.map((day) => day.toUpperCase()).join(', ')
    : 'No days selected'

  return (
    <Card className="rounded-lg border-muted p-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 text-emerald-500">
          <BellRing className="h-5 w-5" />
          <p className="text-sm font-semibold text-foreground">Reminder active</p>
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Time:</span> {reminder.reminderTime}
          </p>
          <p>
            <span className="font-medium text-foreground">Frequency:</span> {frequencyLabel}
          </p>
          {reminder.reminderFrequency !== 'Daily' ? (
            <p>
              <span className="font-medium text-foreground">Days:</span> {selectedDays}
            </p>
          ) : null}
          {reminder.notificationTitle ? (
            <p>
              <span className="font-medium text-foreground">Title:</span>{' '}
              {reminder.notificationTitle}
            </p>
          ) : null}
          {reminder.notificationMessage ? (
            <p>
              <span className="font-medium text-foreground">Message:</span>{' '}
              {reminder.notificationMessage}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
