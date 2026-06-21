import { useState } from 'react'
import { DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function HabitForm({ habit, onSubmit, onCancel, submitting }) {
  const [title, setTitle] = useState(habit?.title || '')
  const [emoji, setEmoji] = useState(habit?.emoji || '✅')

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ title, emoji })
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
      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Emoji</span>
        <Input
          maxLength={4}
          placeholder="📚"
          value={emoji}
          onChange={(event) => setEmoji(event.target.value)}
        />
      </label>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={submitting || !title.trim()} type="submit">
          {habit ? 'Save habit' : 'Add habit'}
        </Button>
      </DialogFooter>
    </form>
  )
}
