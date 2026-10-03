import {
  ChevronRight,
  Flame,
} from 'lucide-react'

import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { getCurrentStreak, getStreakUnit } from '../utils/date'

const accents = [
  '#35D399',
  '#60A5FA',
  '#A78BFA',
  '#FBBF24',
  '#FB7185',
  '#22D3EE',
]

const habitAccent = (habit) =>
  habit.color ||
  accents[
    (habit.title || '')
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) % accents.length
  ]

export default function HabitCard({
  habit,
  onOpenDetails,
}) {
  const isResistance = habit.category === 'resistance'
  const accent = habitAccent(habit)
  const streak = getCurrentStreak(habit)
  const streakUnit = getStreakUnit(habit)
  const totalCompletedDays = (habit.completionHistory || []).length

  return (
    <Card className="overflow-hidden transition-colors hover:border-primary/30">
      <CardContent className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => onOpenDetails(habit)}
          className="flex w-full items-center gap-3 text-left"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{
              backgroundColor: `${accent}20`,
              boxShadow: `inset 3px 0 0 ${accent}`,
            }}
          >
            {habit.emoji}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">
              {habit.title}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" style={{ color: accent }} />
                {streak} {streakUnit} streak
              </span>
              <span>
                {totalCompletedDays}{' '}
                {isResistance ? 'successful days' : 'completed days'}
              </span>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </button>

        <Button
          className="mt-3 w-full"
          variant="outline"
          onClick={() => onOpenDetails(habit)}
        >
          View habit
        </Button>
      </CardContent>
    </Card>
  )
}
