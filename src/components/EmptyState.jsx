import { Sparkles } from 'lucide-react'
import { Button } from './ui/button'

export default function EmptyState({ onAdd }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Start your first habit today.</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Build consistency with a tiny daily action and watch the streak grow.
      </p>
      {onAdd ? (
        <Button className="mt-5" onClick={onAdd}>
          Add habit
        </Button>
      ) : null}
    </div>
  )
}
