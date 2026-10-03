import { useState } from 'react'
import { DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import HabitEmojiPicker from './HabitEmojiPicker'

export default function HabitForm({ habit, onSubmit, onCancel, submitting }) {
  const [title, setTitle] = useState(habit?.title || '')
  const [category, setCategory] = useState(habit?.category || 'consistency')
  const [emoji, setEmoji] = useState(habit?.emoji || '✅')
  const [frequencyType, setFrequencyType] = useState(habit?.frequencyType || 'daily')
  const [weeklyTarget, setWeeklyTarget] = useState(habit?.weeklyTarget || 3)
  const [scheduledDays, setScheduledDays] = useState(habit?.scheduledDays || [])

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ title, emoji, category, frequencyType, weeklyTarget, scheduledDays })
  }

  function toggleScheduledDay(day) {
    if (scheduledDays.includes(day)) {
      if (scheduledDays.length > 3) {
        setScheduledDays(scheduledDays.filter((value) => value !== day))
      }
      return
    }

    setScheduledDays(
      [...scheduledDays, day].sort((left, right) =>
        (left === 0 ? 7 : left) - (right === 0 ? 7 : right),
      ),
    )
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Habit name</span>
        <Input
          required
          maxLength={80}
          placeholder="Read for 20 minutes"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <fieldset className="space-y-2"><legend className="text-sm font-medium text-foreground">Category</legend><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setCategory('consistency')} className={`rounded-xl border p-3 text-left text-sm font-medium ${category === 'consistency' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>🌱 Consistency<span className="mt-1 block text-xs font-normal text-muted-foreground">Build a positive habit</span></button><button type="button" onClick={() => setCategory('resistance')} className={`rounded-xl border p-3 text-left text-sm font-medium ${category === 'resistance' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>🛑 Resistance<span className="mt-1 block text-xs font-normal text-muted-foreground">Reduce an unwanted habit</span></button></div></fieldset>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">How often?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { value: 'daily', label: 'Every day' },
            { value: 'weekly', label: 'X times per week' },
            { value: 'specific-days', label: 'Specific days' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={frequencyType === option.value}
              onClick={() => setFrequencyType(option.value)}
              className={`rounded-lg border p-3 text-left text-sm font-medium ${frequencyType === option.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {frequencyType === 'weekly' ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Choose a weekly target</p>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map((target) => (
                <button
                  key={target}
                  type="button"
                  aria-pressed={weeklyTarget === target}
                  onClick={() => setWeeklyTarget(target)}
                  className={`rounded-lg border py-2 text-sm font-medium ${weeklyTarget === target ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
                >
                  {target}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {frequencyType === 'specific-days' ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Select at least 3 days</p>
            <div className="grid grid-cols-7 gap-1.5">
              {[
                { day: 1, label: 'Mon' },
                { day: 2, label: 'Tue' },
                { day: 3, label: 'Wed' },
                { day: 4, label: 'Thu' },
                { day: 5, label: 'Fri' },
                { day: 6, label: 'Sat' },
                { day: 0, label: 'Sun' },
              ].map(({ day, label }) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={scheduledDays.includes(day)}
                  onClick={() => toggleScheduledDay(day)}
                  className={`rounded-lg border px-1 py-2 text-xs font-medium ${scheduledDays.includes(day) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </fieldset>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Emoji</span>
        <Input
          maxLength={4}
          placeholder="📚"
          value={emoji}
          onChange={(event) => setEmoji(event.target.value)}
        />
      </label>
      <HabitEmojiPicker value={emoji} onChange={setEmoji} />
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={
            submitting ||
            !title.trim() ||
            (frequencyType === 'specific-days' && scheduledDays.length < 3)
          }
          type="submit"
        >
          {habit ? 'Save habit' : 'Add habit'}
        </Button>
      </DialogFooter>
    </form>
  )
}
