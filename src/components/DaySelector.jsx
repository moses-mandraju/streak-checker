const days = [
  { key: 'sun', label: 'S' },
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
]

export function DaySelector({ selectedDays, onChange, disabled }) {
  function toggleDay(day) {
    if (disabled) return
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((value) => value !== day))
    } else {
      onChange([...selectedDays, day])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {days.map((day, index) => (
        <button
          key={`${day.key}-${index}`}
          type="button"
          onClick={() => toggleDay(day.key)}
          disabled={disabled}
          className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
            selectedDays.includes(day.key)
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-input bg-background text-foreground hover:border-emerald-500 hover:text-emerald-600'
          }`}
        >
          {day.label}
        </button>
      ))}
    </div>
  )
}
