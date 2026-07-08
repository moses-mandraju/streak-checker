import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { format, subDays } from 'date-fns'

import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { Card, CardContent } from '../components/ui/card'
import { useHabitStore } from '../store/habitStore'
import { getCompletionStats, DATE_KEY } from '../utils/date'

const DAYS = 14

function getLast14Days() {
  return Array.from({ length: DAYS }, (_, i) => {
    const d = subDays(new Date(), DAYS - 1 - i)
    return format(d, DATE_KEY)
  })
}

function getRollingStreak(binaryData) {
  return binaryData.map((_, i) => {
    let streak = 0
    for (let j = Math.max(0, i - 6); j <= i; j++) streak += binaryData[j]
    return streak
  })
}

const HabitCharts = memo(function HabitCharts({ habit, stats, chartData, chartReady }) {
  const barRef = useRef(null)
  const lineRef = useRef(null)
  const barChart = useRef(null)
  const lineChart = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.Chart || !chartReady || !chartData) return

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const gridColor = isDark ? '#2c2c2a' : '#e1e0d9'
    const tickColor = '#898781'

    if (barChart.current) barChart.current.destroy()
    if (lineChart.current) lineChart.current.destroy()

    barChart.current = new window.Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.binary,
            backgroundColor: '#2a78d6',
            borderRadius: 3,
            borderSkipped: false,
            barThickness: 14,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              // Show the date as the tooltip title
              title: (items) => {
                try {
                  return chartData.labels[items[0].dataIndex]
                } catch (e) {
                  return ''
                }
              },
              // Show a human-friendly label for completion status
              label: (c) => (c.raw === 1 ? 'Completed ✓' : 'Missed'),
            },
          },
        },
        scales: {
          x: {
            type: 'category',
            ticks: {
              color: tickColor,
              font: { size: 9 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 7,
              callback: function (_value, index, ticks) {
                try {
                  const labels = chartData.labels || []
                  const skip = Math.max(1, Math.ceil(labels.length / 7))
                  return index % skip === 0 ? labels[index] : ''
                } catch (e) {
                  return ''
                }
              },
            },
            grid: { color: gridColor },
            border: { display: false },
          },
          y: {
            min: 0,
            max: 1,
            ticks: {
              color: tickColor,
              font: { size: 10 },
              stepSize: 1,
              callback: (v) => (v === 1 ? '✓' : ''),
            },
            grid: { color: gridColor },
            border: { display: false },
          },
        },
      },
    })

    lineChart.current = new window.Chart(lineRef.current, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.rolling,
            borderColor: '#1baf7a',
            backgroundColor: isDark
              ? 'rgba(27,175,122,0.12)'
              : 'rgba(27,175,122,0.10)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#1baf7a',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => {
                try {
                  return chartData.labels[items[0].dataIndex]
                } catch (e) {
                  return ''
                }
              },
              label: (c) => `${c.raw} day${c.raw === 1 ? '' : 's'}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: tickColor,
              font: { size: 10 },
              maxRotation: 0,
              maxTicksLimit: 7,
            },
            grid: { display: false },
            border: { display: false },
          },
          y: {
            min: 0,
            max: 7,
            ticks: {
              color: tickColor,
              font: { size: 10 },
              stepSize: 1,
            },
            grid: { color: gridColor },
            border: { display: false },
          },
        },
      },
    })

    return () => {
      barChart.current?.destroy()
      lineChart.current?.destroy()
    }
  }, [chartReady, chartData, habit.title])

  if (!chartReady) {
    return <ChartCardSkeleton />
  }

  return (
    <Card className="hover:-translate-y-0.5 hover:shadow-md transition-all">
      <CardContent className="p-5">
        {/* Habit header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-2xl">
            {habit.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{habit.title}</h2>
            <p className="text-xs text-muted-foreground">
              Current streak: {habit.currentStreak || 0}d &nbsp;·&nbsp;
              Longest: {habit.longestStreak || 0}d &nbsp;·&nbsp;
              Completion: {stats.completionPercentage}%
            </p>
          </div>
        </div>

        {/* Metric tiles */}
        <div className="mb-5 grid grid-cols-4 gap-2">
          <Metric label="Current streak" value={`${habit.currentStreak || 0}d`} />
          <Metric label="Longest streak" value={`${habit.longestStreak || 0}d`} />
          <Metric label="Total days" value={stats.totalCompletedDays} />
          <Metric label="Completion" value={`${stats.completionPercentage}%`} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-2 text-xs text-muted-foreground flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-sm"
                style={{ background: '#2a78d6' }}
              />
              Daily completions — 14 days
            </p>
            <div style={{ position: 'relative', height: '110px' }}>
              <canvas
                ref={barRef}
                role="img"
                aria-label={`Daily completions for ${habit.title} over last 14 days`}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground flex items-center gap-1">
              <span
                className="inline-block w-2 h-2 rounded-sm"
                style={{ background: '#1baf7a' }}
              />
              Rolling 7-day streak
            </p>
            <div style={{ position: 'relative', height: '110px' }}>
              <canvas
                ref={lineRef}
                role="img"
                aria-label={`Rolling 7-day streak for ${habit.title}`}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

const Metric = memo(function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-muted p-2 text-center">
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  )
})

function ChartCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mb-5 grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-[110px] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const SummaryTile = memo(function SummaryTile({ label, value }) {
  return (
    <div className="rounded-lg bg-muted p-4">
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <BarChart3 className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
})

export default function StatisticsPage() {
  const habits = useHabitStore((state) => state.habits)
  const loading = useHabitStore((state) => state.loading)
  const [chartReady, setChartReady] = useState(false)

  // Load Chart.js only after the stats data is ready to avoid blocking the initial screen.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.Chart) {
      setChartReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    script.async = true
    script.onload = () => setChartReady(true)
    document.head.appendChild(script)

    return () => {
      script.onload = null
    }
  }, [])

  // Memoize the expensive summary calculations so the page doesn't recompute them on every render.
  const summary = useMemo(() => {
    const totalCompletedDays = habits.reduce(
      (sum, h) => sum + (h.completionHistory?.length || 0),
      0,
    )
    const bestStreak = habits.reduce(
      (max, h) => Math.max(max, h.longestStreak || 0),
      0,
    )
    const avgCompletion =
      habits.length === 0
        ? 0
        : Math.round(
            habits.reduce((sum, h) => sum + getCompletionStats(h).completionPercentage, 0) /
              habits.length,
          )

    return { totalCompletedDays, bestStreak, avgCompletion }
  }, [habits])

  // Cache per-habit statistics and chart series so each card does not recompute them repeatedly.
  const habitCards = useMemo(() => {
    const days = getLast14Days()
    return habits.map((habit) => {
      const stats = getCompletionStats(habit)
      const history = habit.completionHistory || []
      const binary = days.map((day) => (history.includes(day) ? 1 : 0))
      const rolling = getRollingStreak(binary)
      const labels = days.map((day) => {
        const parts = day.split('-')
        return `${parts[2]}/${parts[1]}`
      })

      return {
        habit,
        stats,
        chartData: { labels, binary, rolling },
      }
    })
  }, [habits])

  return (
    <>
      <PageHeader
        eyebrow="Statistics"
        title="Habit performance"
        description="Daily completions and rolling streaks across all your habits."
      />

      {loading ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <ChartCardSkeleton key={index} />
            ))}
          </div>
        </>
      ) : habits.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Summary row */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryTile label="Total habits" value={habits.length} />
            <SummaryTile label="Best streak" value={`${summary.bestStreak}d`} />
            <SummaryTile label="Total completions" value={summary.totalCompletedDays} />
            <SummaryTile label="Avg completion" value={`${summary.avgCompletion}%`} />
          </div>

          {/* Per-habit charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {habitCards.map(({ habit, stats, chartData }) => (
              <HabitCharts
                key={habit.id}
                habit={habit}
                stats={stats}
                chartData={chartData}
                chartReady={chartReady}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}

