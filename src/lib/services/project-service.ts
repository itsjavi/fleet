import { DashboardsRepository } from '../repositories/dashboards-repository'
import { ProjectsRepository } from '../repositories/projects-repository'
import type { Dashboard, Project } from '../types'

export class ProjectService {
  constructor(
    private readonly projectsRepo = new ProjectsRepository(),
    private readonly dashboardsRepo = new DashboardsRepository(),
  ) {}

  async createProjectWithDefaultDashboard(
    project: Project,
    defaultDashboardTitle = 'Main',
  ): Promise<{
    project: Project
    dashboard: Dashboard
  }> {
    await this.projectsRepo.create(project)
    const dashboard: Dashboard = {
      id: crypto.randomUUID(),
      project_id: project.id,
      title: defaultDashboardTitle,
    }
    await this.dashboardsRepo.create(dashboard)
    return { project, dashboard }
  }
}
