import { getDb } from '../db'
import type { Dashboard } from '../types'

export class DashboardsRepository {
  async getById(id: string): Promise<Dashboard | null> {
    const db = await getDb()
    const rows = await db.select<Dashboard[]>(`SELECT id, project_id, title FROM dashboards WHERE id = $1`, [id])
    return rows[0] ?? null
  }
  async listByProject(projectId: string): Promise<Dashboard[]> {
    const db = await getDb()
    return db.select<Dashboard[]>(
      `SELECT id, project_id, title FROM dashboards WHERE project_id = $1 ORDER BY rowid ASC`,
      [projectId],
    )
  }

  async create(dashboard: Dashboard): Promise<void> {
    const db = await getDb()
    await db.execute(`INSERT INTO dashboards (id, project_id, title) VALUES ($1, $2, $3)`, [
      dashboard.id,
      dashboard.project_id,
      dashboard.title,
    ])
  }

  async rename(id: string, title: string): Promise<void> {
    const db = await getDb()
    await db.execute(`UPDATE dashboards SET title = $1 WHERE id = $2`, [title, id])
  }

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute(`DELETE FROM dashboards WHERE id = $1`, [id])
  }
}
