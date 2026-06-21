import { Card, CardContent } from './ui/card'

export default function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
