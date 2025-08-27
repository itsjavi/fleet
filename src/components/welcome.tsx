import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectService } from '@/lib/services/project-service'
import type { Project } from '@/lib/types'
import { nanoid } from 'nanoid'
import { useState } from 'react'

export type WelcomeProps = {
  onCreated?: (projectId: string, dashboardId: string) => void
}

export function Welcome({ onCreated }: WelcomeProps) {
  const service = new ProjectService()
  const [title, setTitle] = useState('My Project')
  const [busy, setBusy] = useState(false)

  async function create() {
    setBusy(true)
    try {
      const project: Project = { id: nanoid(), title }
      const { project: p, dashboard } = await service.createProjectWithDefaultDashboard(project, 'Dashboard 1')
      onCreated?.(p.id, dashboard.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-lg rounded-lg border p-6">
      <div className="flex items-center justify-center gap-2 mb-4">
        <img src="/icon.webp" alt="Fleet" className="h-20 w-20" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">Welcome to Fleet</h2>
      <p className="mb-4 text-sm text-neutral-500">
        Create your first project to get started. We'll also create a default dashboard for you.
      </p>
      <div className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="Project title" />
        <Button onClick={create} disabled={busy}>
          Create
        </Button>
      </div>
    </div>
  )
}
