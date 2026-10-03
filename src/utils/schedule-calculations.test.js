import assert from 'node:assert/strict'
import test from 'node:test'
import { format, subDays } from 'date-fns'
import {
  calculateScheduledStreaks,
  calculateStreaksFromHistory,
  getCompletionStats,
  getDashboardDateKeys,
  getScheduleProgress,
} from './date.js'
import { getReachedStreakMilestone } from './streak-milestones.js'

test('habits without frequency fields retain daily streak and dashboard behavior', () => {
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  const habit = {
    completionHistory: [yesterday, today],
    createdDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
  }

  assert.equal(calculateStreaksFromHistory(habit.completionHistory).currentStreak, 2)
  assert.deepEqual(
    getScheduleProgress(habit, [yesterday, today]),
    { completed: 2, possible: 2 },
  )
  assert.equal(getCompletionStats(habit).completionPercentage, 100)
})

test('specific-day streaks skip unscheduled days and ignore pre-creation history', () => {
  const result = calculateScheduledStreaks(
    {
      frequencyType: 'specific-days',
      scheduledDays: [1, 3, 5],
      createdDate: '2026-10-07',
    },
    ['2026-10-05', '2026-10-07', '2026-10-08', '2026-10-09'],
    new Date(2026, 9, 10),
  )

  assert.equal(result.currentStreak, 2)
  assert.equal(result.longestStreak, 2)
  assert.deepEqual(result.completionHistory, [
    '2026-10-05',
    '2026-10-07',
    '2026-10-08',
    '2026-10-09',
  ])
  assert.deepEqual(
    getScheduleProgress(
      {
        frequencyType: 'specific-days',
        scheduledDays: [1, 3, 5],
        createdDate: '2026-10-07',
        completionHistory: ['2026-10-05', '2026-10-07', '2026-10-08', '2026-10-09'],
      },
      ['2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10'],
    ),
    { completed: 3, possible: 3 },
  )
})

test('weekly streaks use weekly targets and keep current unfinished week handling', () => {
  const result = calculateScheduledStreaks(
    {
      frequencyType: 'weekly',
      weeklyTarget: 3,
      createdDate: '2026-09-28',
    },
    ['2026-09-28', '2026-09-30', '2026-10-02', '2026-10-05', '2026-10-06'],
    new Date(2026, 9, 8),
  )

  assert.equal(result.currentStreak, 1)
  assert.equal(result.longestStreak, 1)
})

test('weekly dashboard progress is measured against its target, not seven daily checks', () => {
  const result = getScheduleProgress(
    {
      frequencyType: 'weekly',
      weeklyTarget: 4,
      createdDate: '2026-10-01',
      completionHistory: ['2026-10-01', '2026-10-03', '2026-10-05', '2026-10-06', '2026-10-07'],
    },
    ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'],
  )

  assert.deepEqual(result, { completed: 4, possible: 4 })
})

test('Dashboard weekly progress uses the full weekly target for 2 of 3 completions', () => {
  const result = getScheduleProgress(
    {
      frequencyType: 'weekly',
      weeklyTarget: 3,
      createdDate: '2026-10-06',
      completionHistory: ['2026-10-06', '2026-10-07'],
    },
    ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'],
  )

  assert.deepEqual(result, { completed: 2, possible: 3 })
  assert.equal(Math.round(result.completed / result.possible * 100), 67)
})

test('Dashboard specific-day progress counts only scheduled Thu, Fri, and Sat', () => {
  const result = getScheduleProgress(
    {
      frequencyType: 'specific-days',
      scheduledDays: [4, 5, 6],
      createdDate: '2026-09-28',
      completionHistory: ['2026-10-01', '2026-10-02'],
    },
    ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'],
  )

  assert.deepEqual(result, { completed: 2, possible: 3 })
  assert.equal(Math.round(result.completed / result.possible * 100), 67)
})

test('Dashboard includes backdated weekly and specific-day completions in its rolling window', () => {
  const dates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07']
  const weekly = getScheduleProgress(
    {
      frequencyType: 'weekly',
      weeklyTarget: 3,
      createdDate: '2026-10-03',
      completionHistory: ['2026-10-01', '2026-10-02', '2026-10-03'],
    },
    dates,
  )
  const specificDays = getScheduleProgress(
    {
      frequencyType: 'specific-days',
      scheduledDays: [4, 5, 6],
      createdDate: '2026-10-03',
      completionHistory: ['2026-10-01', '2026-10-02', '2026-10-03'],
    },
    dates,
  )

  assert.deepEqual(weekly, { completed: 3, possible: 3 })
  assert.deepEqual(specificDays, { completed: 3, possible: 3 })
})

test('weekly streaks use Monday boundaries and preserve the open-current-period rule', () => {
  const habit = {
    frequencyType: 'weekly',
    weeklyTarget: 3,
    createdDate: '2026-10-05',
  }
  const history = ['2026-10-09', '2026-10-10', '2026-10-11']

  const sunday = calculateScheduledStreaks(habit, history, new Date(2026, 9, 11))
  const monday = calculateScheduledStreaks(habit, history, new Date(2026, 9, 12))

  assert.equal(sunday.currentStreak, 1)
  assert.equal(monday.currentStreak, 1)
  assert.equal(monday.longestStreak, 1)
})

test('mixed-frequency totals weight each habit by its expected schedule units', () => {
  const dates = [
    '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04',
    '2026-10-05', '2026-10-06', '2026-10-07',
  ]
  const habits = [
    ...Array.from({ length: 3 }, () => ({
      completionHistory: ['2026-10-01', '2026-10-02', '2026-10-03'],
    })),
    {
      frequencyType: 'weekly',
      weeklyTarget: 3,
      createdDate: '2026-10-01',
      completionHistory: ['2026-10-01', '2026-10-03', '2026-10-05'],
    },
  ]
  const totals = habits
    .map((habit) => getScheduleProgress(habit, dates))
    .reduce((sum, progress) => ({
      completed: sum.completed + progress.completed,
      possible: sum.possible + progress.possible,
    }), { completed: 0, possible: 0 })

  assert.deepEqual(totals, { completed: 12, possible: 24 })
  assert.equal(Math.round(totals.completed / totals.possible * 100), 50)
})

test('Dashboard date windows preserve the Resistance current-day exclusion', () => {
  const asOfDate = new Date(2026, 9, 3)

  assert.deepEqual(getDashboardDateKeys('consistency', asOfDate), [
    '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30',
    '2026-10-01', '2026-10-02', '2026-10-03',
  ])
  assert.deepEqual(getDashboardDateKeys('resistance', asOfDate), [
    '2026-09-26', '2026-09-27', '2026-09-28', '2026-09-29',
    '2026-09-30', '2026-10-01', '2026-10-02',
  ])
})

test('streak milestones trigger only when a day streak newly crosses a threshold', () => {
  const habit = { category: 'resistance' }
  for (const milestone of [7, 14, 21, 28, 50, 100]) {
    assert.equal(getReachedStreakMilestone(habit, milestone - 1, milestone), milestone)
    assert.equal(getReachedStreakMilestone(habit, milestone, milestone + 1), null)
  }
  assert.equal(getReachedStreakMilestone({ ...habit, frequencyType: 'weekly' }, 6, 7), null)
  assert.equal(
    getReachedStreakMilestone(habit, 6, 7, '2026-10-02', '2026-10-03'),
    null,
  )
  assert.equal(
    getReachedStreakMilestone(habit, 6, 7, '2026-10-03', '2026-10-03'),
    7,
  )
  assert.equal(
    getReachedStreakMilestone({ ...habit, celebratedMilestones: [7] }, 6, 7),
    null,
  )
})