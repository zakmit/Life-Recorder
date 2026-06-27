import { createFileRoute } from '@tanstack/react-router'
import { AppNav } from '#/components/AppNav'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

function SettingsPage() {
  return (
    <div>
      <AppNav />
      <main className="p-6">
        <h1 className="text-xl font-semibold">Settings</h1>
      </main>
    </div>
  )
}
