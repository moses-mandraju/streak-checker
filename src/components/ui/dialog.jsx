import { X } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../utils/cn'

export function Dialog({ open, onOpenChange, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border bg-card p-5 text-card-foreground shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            aria-label="Close"
            className="shrink-0"
            size="icon"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('mt-5 flex justify-end gap-2', className)} {...props} />
}
