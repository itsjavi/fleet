import { DashboardGrid } from '@/components/dashboard-grid'
import { Toolbar } from '@/components/toolbar'
import { Welcome } from '@/components/welcome'
import { LayoutDashboard } from 'lucide-react'
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
      <div className="flex-1 p-2">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Welcome
              onCreated={(pid, did) => {
                setProjectId(pid)
                setDashboardId(did)
                setRefresh((r) => r + 1)
              }}
            />
          </div>
        ) : dashboardId ? (
          <DashboardGrid
            dashboardId={dashboardId}
            layoutMode={layoutMode}
            onDashboardRenamed={() => setRefresh((r) => r + 1)}
            onDashboardDeleted={() => {
              setDashboardId('')
              setRefresh((r) => r + 1)
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <LayoutDashboard className="h-8 w-8" />
            <div className="text-sm">This project has no dashboards yet</div>
          </div>
        )}
      </div>
    </main>
  )
}

export default App
