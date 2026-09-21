import { format, subDays } from 'date-fns'

import { DATE_KEY } from '../utils/date'

import { Card, CardContent } from './ui/card'

function reportFor(habits, category) {
  const selected = habits.filter(
    (habit) =>
      (habit.category || 'consistency') === category,
  )

  // Always evaluate the previous 7 calendar days.
  // Today is intentionally excluded.
  const dates = Array.from(
    { length: 7 },
    (_, index) =>
      format(
        subDays(new Date(), index + 1),
        DATE_KEY,
      ),
  ).reverse()

  let possible = 0
  let completed = 0

  const items = selected.map((habit) => {
    const history = new Set(
      habit.completionHistory || [],
    )

    // Every habit is evaluated against the same
    // 7-day reporting window.
    const count = dates.filter((date) =>
      history.has(date),
    ).length

    possible += dates.length
    completed += count

    return {
      habit,
      completed: count,
      possible: dates.length,
      percent: Math.round(
        (count / dates.length) * 100,
      ),
    }
  })

  return {
    items,

    // Weighted overall percentage.
    //
    // Example:
    // Habit A = 6/7
    // Habit B = 6/7
    //
    // Overall = 12/14 = 85.7% = 86%
    percent: possible
      ? Math.round(
          (completed / possible) * 100,
        )
      : 0,

    completed,
    possible,
  }
}

function CategoryReport({
  icon,
  title,
  detail,
  report,
  accent,
  emptyMessage,
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">

        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold">
              {icon} {title}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {detail}
            </p>
          </div>

          <p
            className="text-3xl font-bold tabular-nums"
            style={{
              color: accent,
            }}
          >
            {report.percent}%
          </p>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${report.percent}%`,
              backgroundColor: accent,
            }}
          />
        </div>

        <div className="mt-5 space-y-3">
          {report.items.length ? (
            report.items.map(
              ({
                habit,
                completed,
                possible,
                percent,
              }) => (
                <div
                  className="flex items-center justify-between gap-3"
                  key={habit.id}
                >
                  <div className="min-w-0">
                    <span className="block truncate text-sm">
                      {habit.emoji} {habit.title}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {completed}/{possible} days
                    </span>
                  </div>

                  <span
                    className="shrink-0 text-sm font-semibold tabular-nums"
                    style={{
                      color: accent,
                    }}
                  >
                    {percent}%
                  </span>
                </div>
              ),
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          )}
        </div>

      </CardContent>
    </Card>
  )
}

export default function WeeklyDashboardReport({
  habits,
  user,
}) {
  const consistency = reportFor(
    habits,
    'consistency',
  )

  const resistance = reportFor(
    habits,
    'resistance',
  )

  const firstName =
    user?.displayName?.split(' ')[0] ||
    'there'

  return (
    <>
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
          Weekly report
        </p>

        <h1 className="mt-2 text-2xl font-semibold">
          Your week, {firstName}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Your performance across the last seven
          completed days.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">

        <CategoryReport
          icon="🌱"
          title="Overall Consistency"
          detail="Positive habits completed over the past 7 days"
          report={consistency}
          accent="#7EE2B0"
          emptyMessage="No consistency habits yet."
        />

        <CategoryReport
          icon="🛑"
          title="Overall Resistance"
          detail="Unwanted habits successfully resisted over the past 7 days"
          report={resistance}
          accent="#FB8A72"
          emptyMessage="No resistance habits yet."
        />

      </div>
    </>
  )
}