import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardsRepository } from '@/lib/repositories/dashboards-repository'
import { ProjectsRepository } from '@/lib/repositories/projects-repository'
import type { Dashboard, Project } from '@/lib/types'
import { MoreHorizontal, Plus } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'

export type ToolbarProps = {
  onProjectChange?: (projectId: string) => void
  onDashboardChange?: (dashboardId: string) => void
  refresh?: number
  initialProjectId?: string
  initialDashboardId?: string
}

export function Toolbar(props: ToolbarProps) {
  const { onProjectChange, onDashboardChange, refresh = 0, initialProjectId, initialDashboardId } = props
  const projectsRepo = new ProjectsRepository()
  const dashboardsRepo = new DashboardsRepository()

  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState<string>('')
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [dashboardId, setDashboardId] = useState<string>('')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const list = await projectsRepo.list()
      setProjects(list)
      if (list.length > 0) {
        if (initialProjectId && list.find((p) => p.id === initialProjectId)) {
          setProjectId(initialProjectId)
        } else {
          setProjectId((prev) => prev || list[0].id)
        }
      } else {
        setProjectId('')
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  useEffect(() => {
    if (!projectId) return
    ;(async () => {
      const list = await dashboardsRepo.listByProject(projectId)
      setDashboards(list)
      if (list.length > 0) {
        if (initialDashboardId && list.find((d) => d.id === initialDashboardId)) {
          setDashboardId(initialDashboardId)
        } else {
          setDashboardId((prev) => prev || list[0].id)
        }
      } else {
        setDashboardId('')
      }
      onProjectChange?.(projectId)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, refresh])

  useEffect(() => {
    if (dashboardId) onDashboardChange?.(dashboardId)
  }, [dashboardId])

  async function handleAddDashboard() {
    if (!projectId) return
    const d: Dashboard = { id: nanoid(), project_id: projectId, title: 'New dashboard' }
    await dashboardsRepo.create(d)
    const list = await dashboardsRepo.listByProject(projectId)
    setDashboards(list)
    setDashboardId(d.id)
  }

  async function renameDashboard(id: string) {
    const title = prompt('New dashboard title?')?.trim()
    if (!title) return
    await dashboardsRepo.rename(id, title)
    const list = await dashboardsRepo.listByProject(projectId)
    setDashboards(list)
  }

  function confirmDelete(id: string) {
    setPendingDeleteId(id)
    setConfirmOpen(true)
  }

  async function doDelete() {
    if (!pendingDeleteId) return
    await dashboardsRepo.delete(pendingDeleteId)
    const list = await dashboardsRepo.listByProject(projectId)
    setDashboards(list)
    setDashboardId(list[0]?.id ?? '')
    setConfirmOpen(false)
    setPendingDeleteId(null)
  }

  return (
    <div className="flex items-center gap-3 border-b px-3 py-2">
      <Select value={projectId} onValueChange={(v) => setProjectId(v)}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Tabs value={dashboardId} onValueChange={setDashboardId} className="flex-1">
        <TabsList>
          {dashboards.map((d) => (
            <div key={d.id} className="inline-flex items-center">
              <TabsTrigger value={d.id}>{d.title}</TabsTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => renameDashboard(d.id)}>Rename</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => confirmDelete(d.id)} className="text-red-600">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </TabsList>
      </Tabs>

      <Button variant="outline" onClick={handleAddDashboard} className="shrink-0">
        <Plus className="mr-2 h-4 w-4" /> Add
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete dashboard?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the dashboard and its widgets. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={doDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
