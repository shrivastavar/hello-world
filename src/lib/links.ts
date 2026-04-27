import type Database from 'better-sqlite3'

const LINK_RE = /\[\[([^\]]+)\]\]/g

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function extractLinks(content: string): string[] {
  const titles: string[] = []
  LINK_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = LINK_RE.exec(content)) !== null) titles.push(m[1])
  return titles
}

export function syncLinks(sourceId: string, content: string, db: Database.Database): void {
  const now = new Date().toISOString()
  const titles = extractLinks(content)

  db.prepare('DELETE FROM links WHERE source_id = ?').run(sourceId)

  const insertLink = db.prepare('INSERT OR IGNORE INTO links (source_id, target_id) VALUES (?, ?)')
  const noteExists = db.prepare('SELECT 1 FROM notes WHERE id = ?')
  const insertNote = db.prepare(
    'INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
  )

  const sync = db.transaction(() => {
    for (const title of titles) {
      const targetId = slugify(title)
      if (!targetId || targetId === sourceId) continue
      if (!noteExists.get(targetId)) insertNote.run(targetId, title, '', now, now)
      insertLink.run(sourceId, targetId)
    }
  })
  sync()
}
