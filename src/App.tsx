import { DashboardGrid } from '@/components/dashboard-grid'
import { Toolbar } from '@/components/toolbar'
import { Welcome } from '@/components/welcome'
import { useState } from 'react'
import './globals.css'

function App() {
  const [dashboardId, setDashboardId] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [refresh, setRefresh] = useState(0)
  const [layoutMode, setLayoutMode] = useState(false)

  const isEmpty = !projectId && !dashboardId

  return (
    <main className="flex h-screen flex-col">
      <Toolbar
        onProjectChange={setProjectId}
        onDashboardChange={setDashboardId}
        refresh={refresh}
        initialProjectId={projectId}
        initialDashboardId={dashboardId}
        layoutMode={layoutMode}
        onToggleLayout={() => setLayoutMode((v) => !v)}
      />
      <div className="flex-1 p-4">
        {isEmpty ? (
          <Welcome
            onCreated={(pid, did) => {
              setProjectId(pid)
              setDashboardId(did)
              setRefresh((r) => r + 1)
            }}
          />
        ) : dashboardId ? (
          <DashboardGrid dashboardId={dashboardId} layoutMode={layoutMode} />
        ) : (
          <div className="text-sm text-neutral-600">Select a project and dashboard</div>
        )}
      </div>
    </main>
  )
}

export default App
