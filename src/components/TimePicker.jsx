export function TimePicker({ value, onChange, disabled }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">Reminder time</span>
      <input
        type="time"
        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
