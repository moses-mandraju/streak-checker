import { ShieldCheck, Sprout } from 'lucide-react'

export default function HabitTypeIcon({ resistance = false, className, style }) {
  const Icon = resistance ? ShieldCheck : Sprout
  return <Icon aria-hidden="true" className={className} style={style} />
}
