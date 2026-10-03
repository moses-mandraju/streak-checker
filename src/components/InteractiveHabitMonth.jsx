import { format, getDay, getDaysInMonth, isSameMonth, startOfMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DATE_KEY } from '../utils/date'
import { cn } from '../utils/cn'
import HabitTypeIcon from './HabitTypeIcon'

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function InteractiveHabitMonth({
  habit,
  accent,
  onToggleDate,
  updatingDate,
  monthDate,
  onPreviousMonth,
  onNextMonth,
  isResistance = false,
}) {
  const today = new Date()
  const displayedMonth = monthDate || today
  const start = startOfMonth(displayedMonth)
  const leading = (getDay(start) + 6) % 7
  const history = habit.completionHistory || []

  const cells = [
    ...Array(leading),
    ...Array.from(
      { length: getDaysInMonth(displayedMonth) },
      (_, index) => index + 1
    ),
  ]

  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {onPreviousMonth ? <button aria-label="Previous month" className="rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground" type="button" onClick={onPreviousMonth}><ChevronLeft className="h-3.5 w-3.5" /></button> : null}
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
            {format(displayedMonth, 'MMMM yyyy')}
          </p>
          {onNextMonth && !isSameMonth(displayedMonth, today) ? <button aria-label="Next month" className="rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground" type="button" onClick={onNextMonth}><ChevronRight className="h-3.5 w-3.5" /></button> : null}
        </div>

        <span className="text-xs text-muted-foreground">
          Tap a day to edit
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((day, index) => (
          <span
            className="pb-1 text-[10px] font-semibold text-muted-foreground"
            key={`${day}-${index}`}
          >
            {day}
          </span>
        ))}

        {cells.map((number, index) => {
          if (!number) {
            return <span key={`blank-${index}`} />
          }

          const date = new Date(
            displayedMonth.getFullYear(),
            displayedMonth.getMonth(),
            number
          )

          const key = format(date, DATE_KEY)
          const complete = history.includes(key)
          const isToday = key === format(today, DATE_KEY)
          const future = date > today
          const updating = updatingDate === key

          return (
            <button
              type="button"
              key={key}
              disabled={future || updating}
              onClick={() => onToggleDate(key)}
              aria-label={`${format(date, 'MMMM d')}: ${
                complete
                  ? 'completed, toggle incomplete'
                  : 'not completed, toggle complete'
              }`}
              className={cn(
                'mx-auto flex h-7 w-7 aspect-square shrink-0 items-center justify-center',
                'rounded-full text-[10px] font-semibold leading-none',
                'transition-transform',
                'enabled:hover:scale-110',
                'disabled:cursor-not-allowed',
                future && 'text-muted-foreground/35',
                !complete &&
                  !future &&
                  'bg-muted/70 text-muted-foreground',
                isToday &&
                  !complete &&
                  'ring-1 ring-primary ring-offset-1 ring-offset-card'
              )}
              style={
                complete
                  ? {
                      backgroundColor: accent,
                      color: '#061512',
                    }
                  : undefined
              }
            >
              {complete ? <HabitTypeIcon resistance={isResistance} className="h-3 w-3" /> : number}
            </button>
          )
        })}
      </div>
    </section>
  )
}
