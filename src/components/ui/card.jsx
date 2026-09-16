import { cn } from '../../utils/cn'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card text-card-foreground shadow-[0_10px_30px_rgb(0_0_0_/_0.10)] transition-all duration-200',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-base font-semibold leading-none tracking-normal', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5 pt-0', className)} {...props} />
}
