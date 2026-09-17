const groups = {
  Popular: ['✅', '⭐', '🔥', '🌱', '💧', '🙏'],
  Health: ['🏃', '💪', '🧘', '🥗', '😴', '🚰'],
  Learning: ['📚', '✍️', '💻', '🧠', '🎓', '🎸'],
  Lifestyle: ['🧹', '💰', '🎨', '📞', '🐕', '🌅'],
  Resistance: ['🛑', '🚭', '🍬', '📵', '🍺', '🎮'],
}

export default function HabitEmojiPicker({ value, onChange }) {
  return <div className="space-y-3">{Object.entries(groups).map(([group, emojis]) => <div key={group}><p className="mb-1.5 text-xs font-semibold text-muted-foreground">{group}</p><div className="flex flex-wrap gap-1.5">{emojis.map((emoji) => <button type="button" aria-label={`Choose ${emoji}`} onClick={() => onChange(emoji)} key={emoji} className={`grid h-9 w-9 place-items-center rounded-lg text-lg transition ${value === emoji ? 'bg-primary/20 ring-1 ring-primary' : 'bg-muted hover:bg-accent'}`}>{emoji}</button>)}</div></div>)}</div>
}
