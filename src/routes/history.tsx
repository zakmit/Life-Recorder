import { createFileRoute } from '@tanstack/react-router'
import { AppNav } from '#/components/AppNav'

export const Route = createFileRoute('/history')({ component: HistoryPage })

function HistoryPage() {
  return (
    <div>
      <AppNav />
      <main className="p-6">
        <h1 className="text-xl font-semibold">History</h1>
      </main>
    </div>
  )
}
