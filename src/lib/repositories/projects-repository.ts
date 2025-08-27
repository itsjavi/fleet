import { getDb } from '../db'
import type { Project } from '../types'

export class ProjectsRepository {
  async list(): Promise<Project[]> {
    const db = await getDb()
    return db.select<Project[]>(`SELECT id, title FROM projects ORDER BY title ASC`)
  }

  async get(id: string): Promise<Project | null> {
    const db = await getDb()
    const rows = await db.select<Project[]>(`SELECT id, title FROM projects WHERE id = $1`, [id])
    return rows[0] ?? null
  }

  async create(project: Project): Promise<void> {
    const db = await getDb()
    await db.execute(`INSERT INTO projects (id, title) VALUES ($1, $2)`, [project.id, project.title])
  }

  async update(project: Project): Promise<void> {
    const db = await getDb()
    await db.execute(`UPDATE projects SET title = $1 WHERE id = $2`, [project.title, project.id])
  }

  async delete(id: string): Promise<void> {
    const db = await getDb()
    await db.execute(`DELETE FROM projects WHERE id = $1`, [id])
  }
}
