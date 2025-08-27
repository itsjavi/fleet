import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { buildOccupancy, firstFit, isRectFree } from '@/lib/grid-occupancy'
import { WidgetsRepository } from '@/lib/repositories/widgets-repository'
import type { Widget } from '@/lib/types'
import { DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, useDraggable } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { MoreHorizontal } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useEffect, useMemo, useState } from 'react'

const CELL_PX = 64
const COLS = 12
const ROWS = 24

export type DashboardGridProps = {
  dashboardId: string
}

export function DashboardGrid({ dashboardId }: DashboardGridProps) {
  const repo = new WidgetsRepository()
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('New widget')
  const [layoutMode, setLayoutMode] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string>('')
  const [preview, setPreview] = useState<{
    col_start: number
    row_start: number
    col_count: number
    row_count: number
  } | null>(null)

  useEffect(() => {
    if (!dashboardId) {
      setWidgets([])
      return
    }
    ;(async () => {
      const list = await repo.listByDashboard(dashboardId)
      setWidgets(list)
    })()
  }, [dashboardId])

  const gridStyle = useMemo(() => {
    return {
      gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
      gridAutoRows: `${CELL_PX}px`,
    } as React.CSSProperties
  }, [])

  function deltaToCells(px: number) {
    return Math.round(px / CELL_PX)
  }

  // legacy overlap helper no longer used (replaced by occupancy grid)

  async function handleDragEnd(event: DragEndEvent) {
    if (!layoutMode) return
    const id = event.active?.id as string
    if (!id) return

    const delta = event.delta
    const current = widgets.find((w) => w.id === id)
    if (!current) return

    const dxCells = deltaToCells(delta.x)
    const dyCells = deltaToCells(delta.y)
    const newColStart = Math.max(1, Math.min(COLS - current.col_count + 1, current.col_start + dxCells))
    const newRowStart = Math.max(1, Math.min(ROWS - current.row_count + 1, current.row_start + dyCells))

    const candidate = {
      id,
      col_start: newColStart,
      row_start: newRowStart,
      col_count: current.col_count,
      row_count: current.row_count,
    }
    const grid = buildOccupancy(
      widgets.filter((w) => w.id !== id),
      COLS,
    )
    if (!isRectFree(grid, COLS, candidate)) return
    const next = widgets.map((w) => (w.id === id ? { ...w, col_start: newColStart, row_start: newRowStart } : w))
    setWidgets(next)
    await repo.updatePositionAndSize(id, candidate)
    setPreview(null)
    // also refresh from DB to ensure UI and DB stay in sync
    const list = await repo.listByDashboard(dashboardId)
    setWidgets(list)
  }

  function handleDragStartEvent(event: DragStartEvent) {
    if (!layoutMode) return
    const id = event.active?.id as string
    if (id) setPreview(null)
  }

  function handleDragMoveEvent(event: DragMoveEvent) {
    if (!layoutMode) return
    const id = event.active?.id as string
    if (!id) return
    const current = widgets.find((w) => w.id === id)
    if (!current) return
    const dxCells = deltaToCells(event.delta.x)
    const dyCells = deltaToCells(event.delta.y)
    const newColStart = Math.max(1, Math.min(COLS - current.col_count + 1, current.col_start + dxCells))
    const newRowStart = Math.max(1, Math.min(ROWS - current.row_count + 1, current.row_start + dyCells))
    const candidate = {
      col_start: newColStart,
      row_start: newRowStart,
      col_count: current.col_count,
      row_count: current.row_count,
    }
    const grid = buildOccupancy(
      widgets.filter((w) => w.id !== id),
      COLS,
    )
    if (isRectFree(grid, COLS, candidate)) setPreview(candidate)
    else setPreview(null)
  }

  function findEmptyPlacement(widthCols: number, heightRows: number): { col_start: number; row_start: number } {
    const grid = buildOccupancy(widgets, COLS)
    const rect = firstFit(grid, COLS, { cols: widthCols, rows: heightRows })
    return { col_start: rect.col_start, row_start: rect.row_start }
  }

  async function addWidget() {
    if (!dashboardId) return
    const size = { cols: 3, rows: 2 }
    const pos = findEmptyPlacement(size.cols, size.rows)
    const widget: Widget = {
      id: nanoid(),
      dashboard_id: dashboardId,
      title,
      col_start: pos.col_start,
      row_start: pos.row_start,
      col_count: size.cols,
      row_count: size.rows,
    }
    await repo.create(widget)
    const list = await repo.listByDashboard(dashboardId)
    setWidgets(list)
    setOpen(false)
  }

  async function resizeWidget(id: string, dx: number, dy: number) {
    const current = widgets.find((w) => w.id === id)
    if (!current) return
    const dxCells = deltaToCells(dx)
    const dyCells = deltaToCells(dy)
    const newCols = Math.max(1, Math.min(COLS - current.col_start + 1, current.col_count + dxCells))
    const newRows = Math.max(1, Math.min(ROWS - current.row_start + 1, current.row_count + dyCells))
    const candidate = {
      id,
      col_start: current.col_start,
      row_start: current.row_start,
      col_count: newCols,
      row_count: newRows,
    }
    const grid = buildOccupancy(
      widgets.filter((w) => w.id !== id),
      COLS,
    )
    if (!isRectFree(grid, COLS, candidate)) return
    const next = widgets.map((w) => (w.id === id ? { ...w, col_count: newCols, row_count: newRows } : w))
    setWidgets(next)
    await repo.updatePositionAndSize(id, candidate)
  }

  async function nudgeSelected(dxCells: number, dyCells: number) {
    if (!selectedId) return
    const current = widgets.find((w) => w.id === selectedId)
    if (!current) return
    const newColStart = Math.max(1, Math.min(COLS - current.col_count + 1, current.col_start + dxCells))
    const newRowStart = Math.max(1, Math.min(ROWS - current.row_count + 1, current.row_start + dyCells))
    const candidate = {
      id: selectedId,
      col_start: newColStart,
      row_start: newRowStart,
      col_count: current.col_count,
      row_count: current.row_count,
    }
    const grid = buildOccupancy(
      widgets.filter((w) => w.id !== selectedId),
      COLS,
    )
    if (!isRectFree(grid, COLS, candidate)) return
    setWidgets((ws) =>
      ws.map((w) => (w.id === selectedId ? { ...w, col_start: newColStart, row_start: newRowStart } : w)),
    )
    await repo.updatePositionAndSize(selectedId, candidate)
  }

  async function renameWidget(id: string) {
    const name = prompt('New widget title?')?.trim()
    if (!name) return
    await repo.rename(id, name)
    setWidgets((ws) => ws.map((w) => (w.id === id ? { ...w, title: name } : w)))
  }

  function confirmDelete(id: string) {
    setPendingDeleteId(id)
    setConfirmOpen(true)
  }

  async function doDelete() {
    if (!pendingDeleteId) return
    await repo.delete(pendingDeleteId)
    setWidgets((ws) => ws.filter((w) => w.id !== pendingDeleteId))
    setConfirmOpen(false)
    setPendingDeleteId(null)
  }

  function WidgetCard(props: {
    w: Widget
    layoutMode: boolean
    selected: boolean
    onSelect: () => void
    onResize: (dx: number, dy: number) => void
    onRename: () => void
    onDelete: () => void
  }) {
    const { w, layoutMode, selected, onSelect, onResize, onRename, onDelete } = props
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: w.id, disabled: !layoutMode })
    return (
      <div
        id={w.id}
        ref={setNodeRef}
        {...(layoutMode ? listeners : {})}
        {...attributes}
        className={
          'group relative rounded border p-2 shadow-sm outline-none ' +
          (selected ? 'border-blue-500 ' : '') +
          (layoutMode
            ? ' cursor-grab active:cursor-grabbing bg-white/70 dark:bg-neutral-900/70'
            : ' bg-white/60 dark:bg-neutral-900/60')
        }
        style={{
          gridColumn: `${w.col_start} / span ${w.col_count}`,
          gridRow: `${w.row_start} / span ${w.row_count}`,
          minWidth: CELL_PX,
          minHeight: CELL_PX,
          transform: transform ? CSS.Translate.toString(transform) : undefined,
        }}
        onClick={onSelect}
        tabIndex={0}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{w.title}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-xs text-neutral-500">
          {w.col_start},{w.row_start} · {w.col_count}×{w.row_count}
        </div>

        {layoutMode && (
          <div
            className="absolute bottom-1 right-1 hidden h-3 w-3 cursor-nwse-resize rounded bg-neutral-400 group-hover:block"
            onMouseDown={(e) => {
              e.preventDefault()
              const startX = e.clientX
              const startY = e.clientY
              function onMove(ev: MouseEvent) {
                onResize(ev.clientX - startX, ev.clientY - startY)
              }
              function onUp() {
                window.removeEventListener('mousemove', onMove)
                window.removeEventListener('mouseup', onUp)
              }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
            title="Resize"
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-500">
          {layoutMode ? 'Layout mode: drag to move, use handle to resize.' : 'View mode'}
        </div>
        <div className="flex items-center gap-2">
          {layoutMode && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Add widget</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add widget</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <Input value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="Title" />
                </div>
                <DialogFooter>
                  <Button onClick={addWidget}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button size="sm" variant={layoutMode ? 'default' : 'outline'} onClick={() => setLayoutMode((v) => !v)}>
            {layoutMode ? 'Done' : 'Layout'}
          </Button>
        </div>
      </div>

      <DndContext
        modifiers={layoutMode ? [restrictToParentElement] : []}
        onDragStart={handleDragStartEvent}
        onDragMove={handleDragMoveEvent}
        onDragEnd={handleDragEnd}
      >
        <div
          className="grid gap-2"
          style={{ ...gridStyle, height: `${ROWS * CELL_PX}px` }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault()
              nudgeSelected(-1, 0)
            } else if (e.key === 'ArrowRight') {
              e.preventDefault()
              nudgeSelected(1, 0)
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              nudgeSelected(0, -1)
            } else if (e.key === 'ArrowDown') {
              e.preventDefault()
              nudgeSelected(0, 1)
            }
          }}
          tabIndex={0}
        >
          {widgets.map((w) => (
            <WidgetCard
              key={w.id}
              w={w}
              layoutMode={layoutMode}
              selected={selectedId === w.id}
              onSelect={() => setSelectedId(w.id)}
              onResize={(dx, dy) => resizeWidget(w.id, dx, dy)}
              onRename={() => renameWidget(w.id)}
              onDelete={() => confirmDelete(w.id)}
            />
          ))}
          {layoutMode && preview && (
            <div
              className="pointer-events-none rounded border-2 border-dashed border-blue-500/60 bg-blue-500/10"
              style={{
                gridColumn: `${preview.col_start} / span ${preview.col_count}`,
                gridRow: `${preview.row_start} / span ${preview.row_count}`,
              }}
            />
          )}
        </div>
      </DndContext>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete widget?</AlertDialogTitle>
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
