import { getDb } from '../db'
import type { Widget } from '../types'

export class WidgetsRepository {
  async listByDashboard(dashboardId: string): Promise<Widget[]> {
    const db = await getDb()
    return db.select<Widget[]>(
      `SELECT id, dashboard_id, title, col_start, row_start, col_count, row_count
       FROM widgets WHERE dashboard_id = $1`,
      [dashboardId],
    )
  }

  async create(widget: Widget): Promise<void> {
    const db = await getDb()
    await db.execute(
      `INSERT INTO widgets (id, dashboard_id, title, col_start, row_start, col_count, row_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        widget.id,
        widget.dashboard_id,
        widget.title,
        widget.col_start,
        widget.row_start,
        widget.col_count,
        widget.row_count,
      ],
    )
  }

  async updatePositionAndSize(
    id: string,
    { col_start, row_start, col_count, row_count }: Pick<Widget, 'col_start' | 'row_start' | 'col_count' | 'row_count'>,
  ): Promise<void> {
    const db = await getDb()
    await db.execute(
      `UPDATE widgets SET col_start = $1, row_start = $2, col_count = $3, row_count = $4 WHERE id = $5`,
      [col_start, row_start, col_count, row_count, id],
    )
  }

  async rename(id: string, title: string): Promise<void> {
    const db = await getDb()
    await db.execute(`UPDATE widgets SET title = $1 WHERE id = $2`, [title, id])
  }

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute(`DELETE FROM widgets WHERE id = $1`, [id])
  }
}
