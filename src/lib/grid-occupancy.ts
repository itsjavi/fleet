import type { Widget } from './types'

export type GridRect = {
  col_start: number
  row_start: number
  col_count: number
  row_count: number
}

export function buildOccupancy(widgets: Widget[], cols: number): boolean[][] {
  const grid: boolean[][] = []
  const ensureRow = (r: number) => {
    while (grid.length <= r) grid.push(Array(cols + 1).fill(false))
  }
  for (const w of widgets) {
    const top = w.row_start
    const bottom = w.row_start + w.row_count - 1
    const left = w.col_start
    const right = w.col_start + w.col_count - 1
    for (let r = top; r <= bottom; r++) {
      ensureRow(r)
      for (let c = left; c <= right; c++) {
        if (c >= 1 && c <= cols) grid[r][c] = true
      }
    }
  }
  return grid
}

export function isRectFree(grid: boolean[][], cols: number, rect: GridRect): boolean {
  const left = rect.col_start
  const right = rect.col_start + rect.col_count - 1
  const top = rect.row_start
  const bottom = rect.row_start + rect.row_count - 1
  if (left < 1 || right > cols || top < 1) return false
  for (let r = top; r <= bottom; r++) {
    if (grid[r]) {
      for (let c = left; c <= right; c++) {
        if (grid[r][c]) return false
      }
    }
  }
  return true
}

export function firstFit(grid: boolean[][], cols: number, size: { cols: number; rows: number }): GridRect {
  const maxScanRows = Math.max(grid.length + 20, 200)
  for (let r = 1; r < maxScanRows; r++) {
    for (let c = 1; c <= cols - size.cols + 1; c++) {
      const rect: GridRect = { col_start: c, row_start: r, col_count: size.cols, row_count: size.rows }
      if (isRectFree(grid, cols, rect)) return rect
    }
  }
  return { col_start: 1, row_start: (grid.length || 1) + 1, col_count: size.cols, row_count: size.rows }
}
