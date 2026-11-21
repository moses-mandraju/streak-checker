import {
  addMonths,
  format,
  isSameMonth,
  isToday,
  subMonths,
} from 'date-fns'
import {
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { deleteTask, moveTaskToTomorrow, toggleTask } from '../services/taskService'
import { DATE_KEY, todayKey } from '../utils/date'
import {
  compareTaskTimes,
  getMonthCalendarDays,
  getTasksForView,
  taskTimeLabel,
} from '../utils/task-planner'
import { useAuthStore } from '../store/authStore'
import { useTaskStore } from '../store/taskStore'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import TaskEditorDialog from './TaskEditorDialog'

const views = [
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'calendar', label: 'Calendar' },
]

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function TodaysTodo() {
  const user = useAuthStore((state) => state.user)
  const tasks = useTaskStore((state) => state.tasks)
  const loading = useTaskStore((state) => state.loading)
  const [view, setView] = useState('today')
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [monthDate, setMonthDate] = useState(new Date())
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const tasksByDate = useMemo(() => {
    const dates = new Map()
    tasks.forEach((task) => {
      const dateKey = task.dueDate || todayKey()
      const current = dates.get(dateKey) || []
      dates.set(dateKey, [...current, task])
    })
    return dates
  }, [tasks])

  const visibleTasks = useMemo(
    () => getTasksForView(tasks, view, todayKey(), selectedDate),
    [tasks, selectedDate, view],
  )

  function selectDate(date) {
    const dateKey = format(date, DATE_KEY)
    setSelectedDate(dateKey)
    setMonthDate(date)
    setView('calendar')
  }

  async function handleToggle(task) {
    try {
      await toggleTask(user.uid, task)
    } catch (error) {
      toast.error(error?.message || 'Unable to update task.')
    }
  }

  async function handleDelete(task) {
    try {
      await deleteTask(user.uid, task.id)
    } catch (error) {
      toast.error(error?.message || 'Unable to delete task.')
    }
  }

  async function handleMoveToTomorrow(task) {
    try {
      await moveTaskToTomorrow(user.uid, task)
    } catch (error) {
      toast.error(error?.message || 'Unable to reschedule task.')
    }
  }

  function openCreateEditor() {
    if (selectedDate < todayKey()) {
      setSelectedDate(todayKey())
      setMonthDate(new Date())
    }
    setEditingTask(null)
    setEditorOpen(true)
  }

  function openEditEditor(task) {
    setEditingTask(task)
    setSelectedDate(task.dueDate || todayKey())
    setMonthDate(task.dueDate ? new Date(`${task.dueDate}T00:00:00`) : new Date())
    setEditorOpen(true)
  }

  const heading = view === 'today'
    ? 'Today and overdue'
    : view === 'upcoming'
      ? 'Upcoming tasks'
      : format(parseSelectedDate(selectedDate), 'EEEE, MMMM d')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-border bg-card/70 p-1" role="tablist" aria-label="Task view">
          {views.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={view === item.value}
              onClick={() => {
                setView(item.value)
                if (item.value === 'today') {
                  setSelectedDate(todayKey())
                  setMonthDate(new Date())
                }
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition sm:px-4 ${
                view === item.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Button onClick={openCreateEditor}>
          <CalendarPlus className="h-4 w-4" />
          <span>Schedule task</span>
        </Button>
      </div>

      <MiniCalendar
        monthDate={monthDate}
        selectedDate={selectedDate}
        tasksByDate={tasksByDate}
        onPrevious={() => setMonthDate((month) => subMonths(month, 1))}
        onNext={() => setMonthDate((month) => addMonths(month, 1))}
        onSelectDate={selectDate}
      />

      <section aria-label={heading}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">
              {view === 'calendar' ? 'Selected date' : view}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{heading}</h2>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
            {visibleTasks.length} task{visibleTasks.length === 1 ? '' : 's'}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : (
          <TaskScheduleList
            tasks={visibleTasks}
            view={view}
            selectedDate={selectedDate}
            onToggle={handleToggle}
            onEdit={openEditEditor}
            onDelete={handleDelete}
            onMoveToTomorrow={handleMoveToTomorrow}
            onCreate={openCreateEditor}
          />
        )}
      </section>

      {editorOpen ? (
        <TaskEditorDialog
          key={`${editingTask?.id || 'new'}-${selectedDate}`}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          task={editingTask}
          selectedDate={editingTask?.dueDate || selectedDate}
          userId={user.uid}
        />
      ) : null}

    </div>
  )
}

function MiniCalendar({
  monthDate,
  selectedDate,
  tasksByDate,
  onPrevious,
  onNext,
  onSelectDate,
}) {
  const days = getMonthCalendarDays(monthDate)

  return (
    <Card className="border-primary/15">
      <CardContent className="p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">{format(monthDate, 'MMMM yyyy')}</h2>
          </div>
          <div className="flex items-center gap-1">
            <CalendarTodayButton onClick={() => onSelectDate(new Date())} />
            <button type="button" aria-label="Previous month" onClick={onPrevious} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Next month" onClick={onNext} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {weekdays.map((day, index) => (
            <span key={`${day}-${index}`} className="pb-1 text-center text-[10px] font-semibold text-muted-foreground sm:text-xs">
              {day}
            </span>
          ))}
          {days.map((date) => {
            const dateKey = format(date, DATE_KEY)
            const selected = dateKey === selectedDate
            const today = isToday(date)
            const hasTasks = (tasksByDate.get(dateKey) || []).length > 0

            return (
              <button
                key={dateKey}
                type="button"
                aria-label={`${format(date, 'MMMM d, yyyy')}${hasTasks ? ', has tasks' : ''}${selected ? ', selected' : ''}${today ? ', today' : ''}`}
                aria-pressed={selected}
                onClick={() => onSelectDate(date)}
                className={`mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-full text-xs transition sm:h-10 sm:w-10 ${
                  selected
                    ? 'bg-primary font-semibold text-primary-foreground shadow-sm'
                    : today
                      ? 'bg-primary/10 font-semibold text-primary ring-1 ring-primary/60'
                      : 'text-foreground hover:bg-accent'
                } ${!isSameMonth(date, monthDate) ? 'opacity-35' : ''}`}
              >
                <span>{format(date, 'd')}</span>
                <span className={`mt-0.5 h-1 w-1 rounded-full ${hasTasks ? selected ? 'bg-primary-foreground' : 'bg-primary' : 'bg-transparent'}`} />
              </button>
            )
          })}
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary/40 ring-1 ring-primary" />Today</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Selected</span>
          <span className="inline-flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-primary" />Has tasks</span>
        </div>
      </CardContent>
    </Card>
  )
}

function CalendarTodayButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mr-1 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
    >
      Today
    </button>
  )
}

function TaskScheduleList({
  tasks,
  view,
  selectedDate,
  onToggle,
  onEdit,
  onDelete,
  onMoveToTomorrow,
  onCreate,
}) {
  if (!tasks.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-8 text-center">
        <Clock3 className="mx-auto h-6 w-6 text-muted-foreground/60" />
        <p className="mt-2 text-sm font-medium">Nothing planned here yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Schedule a task to add it to your planner.</p>
        {view === 'calendar' ? (
          <Button className="mt-4" variant="outline" onClick={onCreate}>
            <CalendarPlus className="h-4 w-4" />
            Schedule task
          </Button>
        ) : null}
      </div>
    )
  }

  const dateGroups = view === 'upcoming' || view === 'today'
    ? groupByDate(tasks)
    : [{ date: selectedDate, tasks }]

  return (
    <div className="space-y-4">
      {dateGroups.map(({ date, tasks: dateTasks }) => (
        <div key={date} className="space-y-3">
          {dateGroups.length > 1 || view === 'today' ? (
            <p className="px-1 text-xs font-medium text-muted-foreground">
              {date === todayKey() ? 'Today' : format(parseSelectedDate(date), 'EEE, MMM d')}
              {date < todayKey() ? ' · Overdue' : ''}
            </p>
          ) : null}
          <TaskBucket
            title="Scheduled"
            tasks={dateTasks.filter((task) => task.allDay || task.startTime || task.endTime)}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveToTomorrow={onMoveToTomorrow}
          />
          <TaskBucket
            title="Anytime"
            tasks={dateTasks.filter((task) => !task.allDay && !task.startTime && !task.endTime)}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveToTomorrow={onMoveToTomorrow}
          />
        </div>
      ))}
    </div>
  )
}

function groupByDate(tasks) {
  const groups = new Map()
  tasks.forEach((task) => {
    const dateKey = task.dueDate || todayKey()
    const day = groups.get(dateKey) || []
    groups.set(dateKey, [...day, task])
  })
  return [...groups.entries()].map(([date, groupedTasks]) => ({
    date,
    tasks: groupedTasks,
  }))
}

function TaskBucket({ title, tasks, onToggle, onEdit, onDelete, onMoveToTomorrow }) {
  if (!tasks.length) return null
  const pending = tasks.filter((task) => !task.completed).sort(compareTaskTimes)
  const completed = tasks.filter((task) => task.completed).sort(compareTaskTimes)

  return (
    <section className="relative rounded-2xl border border-border bg-card/70">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <ul className="divide-y divide-border">
        {[...pending, ...completed].map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveToTomorrow={onMoveToTomorrow}
          />
        ))}
      </ul>
    </section>
  )
}

function TaskRow({ task, onToggle, onEdit, onDelete, onMoveToTomorrow }) {
  const [menuOpen, setMenuOpen] = useState(false)

  function run(action) {
    setMenuOpen(false)
    action(task)
  }

  return (
    <li className={`relative flex items-center gap-3 px-3 py-3 sm:px-4 ${menuOpen ? 'z-50' : ''}`}>
      <button
        type="button"
        aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
        aria-pressed={task.completed}
        onClick={() => onToggle(task)}
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
          task.completed
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border text-transparent hover:border-primary'
        }`}
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <div className={`min-w-0 flex-1 ${task.completed ? 'opacity-65' : ''}`}>
        <p className={`break-words text-sm font-medium ${task.completed ? 'text-muted-foreground line-through' : ''}`}>
          {task.title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{taskTimeLabel(task)}</span>
          {task.description ? <span className="truncate">· {task.description}</span> : null}
          {task.notificationEnabled && !task.completed ? (
            <span className="text-primary">
              · {{
                sent: 'Reminder sent',
                missed: 'Reminder missed',
                invalid: 'Reminder unavailable',
                sending: 'Reminder sending',
              }[task.reminderStatus] || 'Reminder on'}
            </span>
          ) : null}
        </p>
      </div>
      <div className="relative shrink-0">
        <button
          type="button"
          aria-label={`More actions for ${task.title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
        {menuOpen ? (
          <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-xl">
            <MenuAction icon={Pencil} label="Edit / reschedule" onClick={() => run(onEdit)} />
            {!task.completed ? (
              <MenuAction icon={CalendarDays} label="Move to tomorrow" onClick={() => run(onMoveToTomorrow)} />
            ) : null}
            <MenuAction destructive icon={Trash2} label="Delete task" onClick={() => run(onDelete)} />
          </div>
        ) : null}
      </div>
    </li>
  )
}

function MenuAction({ icon: Icon, label, onClick, destructive = false }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-accent ${
        destructive ? 'text-destructive' : 'text-foreground'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function parseSelectedDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}
