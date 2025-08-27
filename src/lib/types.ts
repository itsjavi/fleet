export type Project = {
  id: string
  title: string
}

export type Dashboard = {
  id: string
  project_id: string
  title: string
}

export type Widget = {
  id: string
  dashboard_id: string
  title: string
  col_start: number
  row_start: number
  col_count: number
  row_count: number
}
