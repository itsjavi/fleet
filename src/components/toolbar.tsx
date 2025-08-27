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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardsRepository } from '@/lib/repositories/dashboards-repository'
import { ProjectsRepository } from '@/lib/repositories/projects-repository'
import { ProjectService } from '@/lib/services/project-service'
import type { Dashboard, Project } from '@/lib/types'
import { cn } from '@/lib/utils'
import { LayoutDashboardIcon, Plus, Settings } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'

export type ToolbarProps = {
  onProjectChange?: (projectId: string) => void
  onDashboardChange?: (dashboardId: string) => void
  refresh?: number
  initialProjectId?: string
  initialDashboardId?: string
  layoutMode?: boolean
  onToggleLayout?: () => void
}

export function Toolbar(props: ToolbarProps) {
  const service = new ProjectService()
  const {
    onProjectChange,
    onDashboardChange,
    refresh = 0,
    initialProjectId,
    initialDashboardId,
    layoutMode = false,
    onToggleLayout,
  } = props
  const projectsRepo = new ProjectsRepository()
  const dashboardsRepo = new DashboardsRepository()

  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState<string>('')
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [dashboardId, setDashboardId] = useState<string>('')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  // Dashboard create dialog
  const [addDashboardOpen, setAddDashboardOpen] = useState(false)
  const [newDashboardName, setNewDashboardName] = useState('')
  const [savingDashboard, setSavingDashboard] = useState(false)

  // Project settings dialogs
  const [addProjectOpen, setAddProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [savingProject, setSavingProject] = useState(false)

  const [renameProjectOpen, setRenameProjectOpen] = useState(false)
  const [renameProjectName, setRenameProjectName] = useState('')
  const [renamingProject, setRenamingProject] = useState(false)

  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false)

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
      let nextId = ''
      if (list.length > 0) {
        if (initialDashboardId && list.find((d) => d.id === initialDashboardId)) {
          nextId = initialDashboardId
        } else if (dashboardId && list.find((d) => d.id === dashboardId)) {
          nextId = dashboardId
        } else {
          nextId = list[0].id
        }
      }
      setDashboardId(nextId)
      onProjectChange?.(projectId)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, refresh])

  useEffect(() => {
    onDashboardChange?.(dashboardId)
  }, [dashboardId])

  async function handleAddDashboard() {
    if (!projectId) return
    const title = newDashboardName.trim()
    if (!title) return
    try {
      setSavingDashboard(true)
      const d: Dashboard = { id: nanoid(), project_id: projectId, title }
      await dashboardsRepo.create(d)
      const list = await dashboardsRepo.listByProject(projectId)
      setDashboards(list)
      setDashboardId(d.id)
      setAddDashboardOpen(false)
      setNewDashboardName('')
    } finally {
      setSavingDashboard(false)
    }
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

  async function submitAddProject() {
    const title = newProjectName.trim()
    if (!title) return
    try {
      setSavingProject(true)
      const { project } = await service.createProjectWithDefaultDashboard({ id: nanoid(), title }, 'Dashboard 1')
      const list = await projectsRepo.list()
      setProjects(list)
      setProjectId(project.id)
      setAddProjectOpen(false)
      setNewProjectName('')
    } finally {
      setSavingProject(false)
    }
  }

  async function submitRenameProject() {
    if (!projectId) return
    const title = renameProjectName.trim()
    if (!title) return
    try {
      setRenamingProject(true)
      const p: Project = { id: projectId, title }
      await projectsRepo.update(p)
      const list = await projectsRepo.list()
      setProjects(list)
      setRenameProjectOpen(false)
    } finally {
      setRenamingProject(false)
    }
  }

  async function submitDeleteProject() {
    if (!projectId) return
    await projectsRepo.delete(projectId)
    const list = await projectsRepo.list()
    setProjects(list)
    setProjectId(list[0]?.id ?? '')
    setDeleteProjectOpen(false)
  }

  if (projects.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-3 border-b px-3 py-2">
      {projects.length > 1 && (
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
      )}

      <Tabs value={dashboardId} onValueChange={setDashboardId} className="flex-1 ">
        <TabsList
          className={cn(
            'flex bg-transparent justify-start w-full items-center gap-2 whitespace-nowrap rounded-lg p-1',
            'max-w-full overflow-x-auto',
          )}
        >
          {dashboards.map((d) => (
            <div key={d.id} className="inline-flex items-stretch">
              <TabsTrigger
                value={d.id}
                className={cn(
                  'rounded-lg border-none text-sm flex',
                  'active-state:bg-neutral-400 dark:active-state:bg-neutral-800',
                  'active-state:text-neutral-900 dark:active-state:text-neutral-100',
                  'hover:bg-neutral-200 dark:hover:bg-neutral-900',
                )}
              >
                <div className="py-2 px-4 flex gap-6 items-center justify-between overflow-hidden">
                  <div className="flex-1">{d.title}</div>
                </div>
              </TabsTrigger>
            </div>
          ))}
          {layoutMode && (
            <>
              <div className="mx-1 h-5 w-px shrink-0 bg-border" />
              <Button
                size="icon"
                variant="ghost"
                className="ml-1 h-7 w-7 shrink-0"
                aria-label="Add dashboard"
                onClick={() => setAddDashboardOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
        </TabsList>
      </Tabs>

      <Button
        title={layoutMode ? 'Exit dashboard editor' : 'Edit dashboard'}
        size="sm"
        variant={layoutMode ? 'default' : 'outline'}
        onClick={onToggleLayout}
        className="shrink-0"
      >
        <LayoutDashboardIcon className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="shrink-0" aria-label="Open settings">
            <Settings className="h-4 w-4" /> <span className="sr-only">Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuItem onClick={() => setAddProjectOpen(true)}>Add project</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setRenameProjectName(projects.find((p) => p.id === projectId)?.title ?? '')
              setRenameProjectOpen(true)
            }}
            disabled={!projectId}
          >
            Rename project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteProjectOpen(true)}
            className="text-destructive"
            disabled={!projectId}
          >
            Delete project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create dashboard dialog */}
      <Dialog open={addDashboardOpen} onOpenChange={setAddDashboardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create dashboard</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <label htmlFor="new-dashboard-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="new-dashboard-name"
              placeholder="e.g. Team Overview"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddDashboard()
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDashboardOpen(false)} disabled={savingDashboard}>
              Cancel
            </Button>
            <Button onClick={handleAddDashboard} disabled={savingDashboard || !newDashboardName.trim()}>
              {savingDashboard ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add project dialog */}
      <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <label htmlFor="new-project-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="new-project-name"
              placeholder="e.g. Marketing"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitAddProject()
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProjectOpen(false)} disabled={savingProject}>
              Cancel
            </Button>
            <Button onClick={submitAddProject} disabled={savingProject || !newProjectName.trim()}>
              {savingProject ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename project dialog */}
      <Dialog open={renameProjectOpen} onOpenChange={setRenameProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <label htmlFor="rename-project-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="rename-project-name"
              value={renameProjectName}
              onChange={(e) => setRenameProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRenameProject()
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameProjectOpen(false)} disabled={renamingProject}>
              Cancel
            </Button>
            <Button onClick={submitRenameProject} disabled={renamingProject || !renameProjectName.trim()}>
              {renamingProject ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction className="bg-destructive hover:bg-red-600" onClick={doDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete project confirmation */}
      <AlertDialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the project and its dashboards and widgets. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-red-600"
              onClick={() => {
                submitDeleteProject()
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
