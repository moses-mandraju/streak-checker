import { useState } from 'react'
import { DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import HabitEmojiPicker from './HabitEmojiPicker'

export default function HabitForm({ habit, onSubmit, onCancel, submitting }) {
  const [title, setTitle] = useState(habit?.title || '')
  const [category, setCategory] = useState(habit?.category || 'consistency')
  const [emoji, setEmoji] = useState(habit?.emoji || '✅')

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ title, emoji, category })
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
        <Button disabled={submitting || !title.trim()} type="submit">
          {habit ? 'Save habit' : 'Add habit'}
        </Button>
      </DialogFooter>
    </form>
  )
}
