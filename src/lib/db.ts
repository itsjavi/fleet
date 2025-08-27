import Database from '@tauri-apps/plugin-sql'

let dbPromise: Promise<Database> | null = null

export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load('sqlite:fleet.db')
  }
  return dbPromise
}
