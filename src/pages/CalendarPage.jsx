import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, format, getDay, subMonths } from 'date-fns'
import PageHeader from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { useHabitStore } from '../store/habitStore'
import { getMonthDays, isCompletedOn } from '../utils/date'
import { cn } from '../utils/cn'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const habits = useHabitStore((state) => state.habits)
  const [monthDate, setMonthDate] = useState(new Date())
  const { days, start } = useMemo(() => getMonthDays(monthDate), [monthDate])
  const leadingBlanks = Array.from({ length: getDay(start) })

  return (
    <>
      <PageHeader
        eyebrow="Calendar"
        title="Monthly completion view"
        description="Completed days are highlighted when at least one habit was checked off."
        action={
          <div className="flex items-center gap-2">
            <Button
              aria-label="Previous month"
              size="icon"
              variant="outline"
              onClick={() => setMonthDate(subMonths(monthDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Next month"
              size="icon"
              variant="outline"
              onClick={() => setMonthDate(addMonths(monthDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{format(monthDate, 'MMMM yyyy')}</h2>
            <p className="text-sm text-muted-foreground">{habits.length} habits tracked</p>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekDays.map((day) => (
              <div key={day} className="py-2 text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {leadingBlanks.map((_, index) => (
              <div key={`blank-${index}`} className="aspect-square rounded-lg bg-muted/40" />
            ))}
            {days.map((day) => {
              const completedCount = habits.filter((habit) => isCompletedOn(habit, day)).length
              const isComplete = completedCount > 0

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center rounded-lg border bg-background text-sm transition-all hover:border-primary',
                    isComplete && 'border-primary bg-primary text-primary-foreground shadow-sm',
                  )}
                >
                  <span className="font-semibold">{format(day, 'd')}</span>
                  <span
                    className={cn(
                      'mt-1 text-[11px] text-muted-foreground',
                      isComplete && 'text-primary-foreground/80',
                    )}
                  >
                    {completedCount || ''}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
