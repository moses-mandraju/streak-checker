import { getDashboardDateKeys, getFrequencyType, getScheduleProgress } from '../utils/date'
import { Card, CardContent } from './ui/card'
import TodaysTodo from './TodaysTodo'
import HabitTypeIcon from './HabitTypeIcon'

function reportFor(habits, category) {
  const selected = habits.filter(
    (habit) =>
      (habit.category || 'consistency') === category,
  )

  const dates = getDashboardDateKeys(category)

  let possible = 0
  let completed = 0

  const items = selected.map((habit) => {
    const { completed: count, possible: expected } = getScheduleProgress(habit, dates)

    possible += expected
    completed += count

    return {
      habit,
      completed: count,
      possible: expected,
      unit: getFrequencyType(habit) === 'weekly'
        ? 'weekly targets'
        : getFrequencyType(habit) === 'specific-days'
          ? 'scheduled days'
          : 'days',
      percent: expected ? Math.round((count / expected) * 100) : 0,
    }
  })

  return {
    items,
    percent: possible ? Math.round((completed / possible) * 100) : 0,
    completed,
    possible,
    unit: new Set(items.map((item) => item.unit)).size === 1
      ? items[0]?.unit || 'days'
      : 'expected',
  }
}

/* -------------------------------------------------- */
/* Animated mountain decoration                       */
/* -------------------------------------------------- */

function MountainScene({ accent, type }) {
  return (
    <div
      className="pointer-events-none absolute right-0 top-0 h-20 w-[40%] overflow-hidden opacity-25 sm:h-44 sm:w-[58%] sm:opacity-90"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 520 190"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient
            id={`mountainGlow-${type}`}
            x1="0"
            y1="1"
            x2="1"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor={accent}
              stopOpacity="0"
            />

            <stop
              offset="55%"
              stopColor={accent}
              stopOpacity="0.16"
            />

            <stop
              offset="100%"
              stopColor={accent}
              stopOpacity="0.32"
            />
          </linearGradient>

          <linearGradient
            id={`mountainBack-${type}`}
            x1="0"
            y1="1"
            x2="1"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor={accent}
              stopOpacity="0.03"
            />

            <stop
              offset="100%"
              stopColor={accent}
              stopOpacity="0.28"
            />
          </linearGradient>

          <linearGradient
            id={`mountainFront-${type}`}
            x1="0"
            y1="1"
            x2="1"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor={accent}
              stopOpacity="0.06"
            />

            <stop
              offset="100%"
              stopColor={accent}
              stopOpacity="0.38"
            />
          </linearGradient>
        </defs>

        {/* Soft glow */}
        <path
          d="M190 150 L310 58 L355 91 L415 18 L520 150 Z"
          fill={`url(#mountainGlow-${type})`}
          className="mountain-glow"
        />

        {/* Distant mountain range */}
        <path
          d="
            M170 158
            L245 96
            L282 119
            L330 76
            L370 106
            L418 42
            L520 137
            L520 190
            L170 190
            Z
          "
          fill={`url(#mountainBack-${type})`}
          className="mountain-back"
        />

        {/* Main mountain */}
        <path
          d="
            M250 172
            L338 87
            L377 122
            L430 25
            L520 128
            L520 190
            L250 190
            Z
          "
          fill={`url(#mountainFront-${type})`}
          className="mountain-front"
        />

        {/* Snow/light peak */}
        <path
          d="
            M430 25
            L415 53
            L427 48
            L438 61
            L449 49
            L462 65
            Z
          "
          fill={accent}
          opacity="0.45"
          className="mountain-snow"
        />

        {/* Small foreground ridge */}
        <path
          d="
            M205 184
            L290 133
            L325 150
            L365 116
            L405 151
            L452 116
            L520 165
            L520 190
            L205 190
            Z
          "
          fill={`url(#mountainGlow-${type})`}
          opacity="0.55"
          className="mountain-ridge"
        />

        {/* Tiny floating glow points */}
        <circle
          cx="383"
          cy="72"
          r="2"
          fill={accent}
          opacity="0.45"
          className="mountain-particle particle-one"
        />

        <circle
          cx="456"
          cy="94"
          r="1.8"
          fill={accent}
          opacity="0.35"
          className="mountain-particle particle-two"
        />

        <circle
          cx="344"
          cy="103"
          r="1.5"
          fill={accent}
          opacity="0.3"
          className="mountain-particle particle-three"
        />
      </svg>

      {/* Fade into card */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            90deg,
            rgba(8, 24, 31, 1) 0%,
            rgba(8, 24, 31, 0.65) 25%,
            rgba(8, 24, 31, 0.05) 75%,
            rgba(8, 24, 31, 0) 100%
          )`,
        }}
      />

      <style>{`
        .mountain-back {
          animation: mountainDriftBack 9s ease-in-out infinite alternate;
          transform-origin: center;
        }

        .mountain-front {
          animation: mountainDriftFront 7s ease-in-out infinite alternate;
          transform-origin: center;
        }

        .mountain-glow {
          animation: mountainGlow 5s ease-in-out infinite alternate;
        }

        .mountain-ridge {
          animation: mountainRidge 8s ease-in-out infinite alternate;
        }

        .mountain-snow {
          animation: mountainSnow 4s ease-in-out infinite alternate;
        }

        .mountain-particle {
          animation: mountainParticle 4s ease-in-out infinite;
        }

        .particle-two {
          animation-delay: 1.2s;
        }

        .particle-three {
          animation-delay: 2.1s;
        }

        @keyframes mountainDriftBack {
          from {
            transform: translateX(0) scale(1);
          }

          to {
            transform: translateX(-7px) scale(1.015);
          }
        }

        @keyframes mountainDriftFront {
          from {
            transform: translateX(0) translateY(0);
          }

          to {
            transform: translateX(-10px) translateY(-3px);
          }
        }

        @keyframes mountainGlow {
          from {
            opacity: 0.45;
          }

          to {
            opacity: 0.9;
          }
        }

        @keyframes mountainRidge {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(8px);
          }
        }

        @keyframes mountainSnow {
          from {
            opacity: 0.25;
          }

          to {
            opacity: 0.55;
          }
        }

        @keyframes mountainParticle {
          0% {
            transform: translateY(5px);
            opacity: 0;
          }

          30% {
            opacity: 0.45;
          }

          70% {
            opacity: 0.25;
          }

          100% {
            transform: translateY(-12px);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mountain-back,
          .mountain-front,
          .mountain-glow,
          .mountain-ridge,
          .mountain-snow,
          .mountain-particle {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

/* -------------------------------------------------- */
/* Circular progress                                  */
/* -------------------------------------------------- */

function ProgressRing({
  percent,
  accent,
  completed,
  possible,
  unit,
}) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress =
    circumference * (percent / 100)

  return (
    <div className="relative h-24 w-24 shrink-0 sm:h-40 sm:w-40">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 128 128"
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
        />

        {percent > 0 && (
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-700"
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold tabular-nums sm:text-3xl"
          style={{ color: accent }}
        >
          {percent}%
        </span>

        <span className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">
          {completed} of {possible} {unit}
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------- */
/* Category card                                      */
/* -------------------------------------------------- */

function CategoryReport({
  title,
  detail,
  report,
  accent,
  emptyMessage,
  isResistance,
}) {
  const missed = Math.max(
    report.possible - report.completed,
    0,
  )
  const progressLabels = report.unit === 'days'
    ? {
        completed: isResistance ? 'Days resisted' : 'Days completed',
        remaining: isResistance ? 'Days not resisted' : 'Days missed',
      }
    : report.unit === 'weekly targets'
      ? { completed: 'Targets met', remaining: 'Targets remaining' }
      : report.unit === 'scheduled days'
        ? { completed: 'Scheduled days met', remaining: 'Scheduled days remaining' }
        : { completed: 'Expected completions', remaining: 'Expected remaining' }

  return (
    <Card
      className="relative overflow-hidden"
      style={{
        borderColor: `${accent}35`,
        background: `
          radial-gradient(
            circle at 100% 0%,
            ${accent}08 0%,
            transparent 45%
          )
        `,
      }}
    >
      {/* Animated mountain background */}
      {report.items.length > 0 && (
        <MountainScene
          accent={accent}
          type={
            isResistance
              ? 'resistance'
              : 'consistency'
          }
        />
      )}

      <CardContent className="relative z-10 p-3.5 sm:p-6">

        {/* Header */}
        <div className="relative z-10 flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
            style={{
              backgroundColor: `${accent}18`,
              boxShadow: `0 0 24px ${accent}12`,
            }}
          >
            <HabitTypeIcon resistance={isResistance} className="h-5 w-5" style={{ color: accent }} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {title}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {detail}
            </p>
          </div>
        </div>

        {report.items.length ? (
          <>
            {/* Main stats */}
            <div className="relative z-10 mt-3 flex items-center gap-3 sm:mt-6 sm:flex-row sm:gap-5">

              <ProgressRing
                percent={report.percent}
                accent={accent}
                completed={report.completed}
                possible={report.possible}
                unit={report.unit}
              />

              <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:flex sm:flex-col sm:gap-4">

                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full sm:h-9 sm:w-9"
                    style={{
                      backgroundColor: `${accent}18`,
                      color: accent,
                    }}
                  >
                    <HabitTypeIcon resistance={isResistance} className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {report.completed}
                    </p>

                      <p className="text-xs text-muted-foreground">
                        {progressLabels.completed}
                      </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full sm:h-9 sm:w-9"
                    style={{
                      backgroundColor: `${accent}10`,
                      color: accent,
                    }}
                  >
                    ○
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {missed}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {progressLabels.remaining}
                    </p>
                  </div>
                </div>

              </div>

              {/* Premium message */}
              <div
                className="hidden rounded-2xl px-4 py-3 text-right sm:block"
                style={{
                  backgroundColor: `${accent}0D`,
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: accent }}
                >
                  {report.percent >= 80
                    ? 'Great progress!'
                    : report.percent >= 50
                      ? 'Keep going!'
                      : 'Every day counts.'}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {isResistance
                    ? 'Stay in control.'
                    : 'Small steps, big progress.'}
                </p>
              </div>

            </div>

            {/* Individual habits */}
            <div
              className="relative z-10 mt-4 border-t pt-3 sm:mt-6 sm:pt-4"
              style={{
                borderColor: `${accent}20`,
              }}
            >
              <div className="space-y-1">

                {report.items.map(
                  ({
                    habit,
                    completed,
                    possible,
                    unit,
                    percent,
                  }) => (
                    <div
                      key={habit.id}
                      className="rounded-xl px-1 py-2 transition-colors hover:bg-white/[0.025] sm:px-2 sm:py-3"
                    >
                      <div className="flex items-center justify-between gap-3">

                        <div className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {habit.emoji}{' '}
                            {habit.title}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {completed}/{possible} {unit}
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

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            background: `linear-gradient(
                              90deg,
                              ${accent},
                              ${accent}CC
                            )`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}

              </div>
            </div>
          </>
        ) : (
          <div
            className="relative z-10 mt-4 flex items-center gap-3 rounded-2xl border p-3 sm:mt-6 sm:gap-4 sm:p-4"
            style={{
              borderColor: `${accent}20`,
              backgroundColor: `${accent}08`,
            }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
              style={{
                backgroundColor: `${accent}15`,
              }}
            >
              <HabitTypeIcon resistance={isResistance} className="h-6 w-6" style={{ color: accent }} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                {emptyMessage}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Add a positive habit to start tracking
                your progress.
              </p>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------- */
/* Dashboard                                          */
/* -------------------------------------------------- */

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
          Your performance over the past 7 days.
        </p>
      </div>

      <TodaysTodo />

      <div className="grid gap-5 lg:grid-cols-2">

        <CategoryReport
          title="Overall Consistency"
          detail="Positive habits completed over the past 7 days"
          report={consistency}
          accent="#35D399"
          emptyMessage="No consistency habits yet."
          isResistance={false}
        />

        <CategoryReport
          title="Overall Resistance"
          detail="Unwanted habits successfully resisted over the past 7 days"
          report={resistance}
          accent="#FB806F"
          emptyMessage="No resistance habits yet."
          isResistance
        />

      </div>
    </>
  )
}
