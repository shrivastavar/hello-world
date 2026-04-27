import { getDb } from './db'
import { slugify, syncLinks } from './links'
import type { Note, NoteWithBacklinks } from '@/types'

export type { Note, NoteWithBacklinks }

export function getDailyNoteId(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `daily-${y}-${m}-${day}`
}

export function listNotes(): Note[] {
  const db = getDb()
  return db
    .prepare('SELECT id, title, content, created_at, updated_at FROM notes ORDER BY updated_at DESC')
    .all() as Note[]
}

export function getNote(id: string): NoteWithBacklinks | null {
  const db = getDb()
  const note = db
    .prepare('SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ?')
    .get(id) as Note | undefined
  if (!note) return null

  const backlinks = db
    .prepare(
      `SELECT n.id, n.title FROM links l
       JOIN notes n ON n.id = l.source_id
       WHERE l.target_id = ?`,
    )
    .all(id) as { id: string; title: string }[]

  return { ...note, backlinks }
}

export function createNote(title: string, content = ''): Note {
  const db = getDb()
  const id = slugify(title) || `note-${Date.now()}`
  const now = new Date().toISOString()
  const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note | undefined
  if (existing) return existing
  db.prepare(
    'INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
  ).run(id, title, content, now, now)
  if (content) syncLinks(id, content, db)
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note
}

export function updateNote(id: string, title: string, content: string): Note | null {
  const db = getDb()
  const now = new Date().toISOString()
  const result = db
    .prepare('UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?')
    .run(title, content, now, id)
  if (result.changes === 0) return null
  syncLinks(id, content, db)
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note
}

export function deleteNote(id: string): boolean {
  const db = getDb()
  return db.prepare('DELETE FROM notes WHERE id = ?').run(id).changes > 0
}

export function searchNotes(query: string): Note[] {
  const db = getDb()
  return db
    .prepare(
      `SELECT n.id, n.title, n.content, n.created_at, n.updated_at
       FROM notes_fts f
       JOIN notes n ON n.id = f.id
       WHERE notes_fts MATCH ?
       ORDER BY rank`,
    )
    .all(query + '*') as Note[]
}
