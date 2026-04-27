'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import NoteEditor from './NoteEditor'
import BacklinksPanel from './BacklinksPanel'
import type { Note, NoteWithBacklinks } from '@/types'

interface Props {
  initialNote: NoteWithBacklinks
  initialNoteList: Note[]
}

export default function AppLayout({ initialNote, initialNoteList }: Props) {
  const router = useRouter()
  const [note, setNote] = useState(initialNote)
  const [noteList, setNoteList] = useState(initialNoteList)

  useEffect(() => {
    setNote(initialNote)
  }, [initialNote.id])

  useEffect(() => {
    setNoteList(initialNoteList)
  }, [initialNote.id])

  const refreshList = useCallback(async () => {
    const res = await fetch('/api/notes')
    if (res.ok) setNoteList(await res.json())
  }, [])

  const navigateTo = useCallback(
    async (id: string) => {
      const check = await fetch(`/api/notes/${id}`)
      if (!check.ok) {
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: id.replace(/-/g, ' ') }),
        })
        await refreshList()
      }
      router.push(`/note/${id}`)
    },
    [router, refreshList],
  )

  const handleNewNote = useCallback(async () => {
    const title = `New Note ${new Date().toLocaleString()}`
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (res.ok) {
      const created = await res.json()
      await refreshList()
      router.push(`/note/${created.id}`)
    }
  }, [router, refreshList])

  const handleSave = useCallback(
    async (title: string, content: string) => {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      if (res.ok) {
        const noteRes = await fetch(`/api/notes/${note.id}`)
        if (noteRes.ok) setNote(await noteRes.json())
        refreshList()
      }
    },
    [note.id, refreshList],
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        notes={noteList}
        currentId={note.id}
        onNavigate={navigateTo}
        onNewNote={handleNewNote}
      />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <NoteEditor note={note} onSave={handleSave} onNavigate={navigateTo} />
      </main>
      <BacklinksPanel backlinks={note.backlinks} onNavigate={navigateTo} />
    </div>
  )
}
