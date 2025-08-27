CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dashboards (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS widgets (
  id TEXT PRIMARY KEY,
  dashboard_id TEXT NOT NULL,
  title TEXT NOT NULL,
  col_start INTEGER NOT NULL,
  row_start INTEGER NOT NULL,
  col_count INTEGER NOT NULL,
  row_count INTEGER NOT NULL,
  FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE
);

