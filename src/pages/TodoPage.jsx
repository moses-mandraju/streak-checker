import PageHeader from '../components/PageHeader'
import TodaysTodo from '../components/TodaysTodo'

export default function TodoPage() {
  return (
    <>
      <PageHeader
        eyebrow="To-Do"
        title="Make today count"
        description="A clear place for today's tasks and small wins."
      />
      <TodaysTodo />
    </>
  )
}
