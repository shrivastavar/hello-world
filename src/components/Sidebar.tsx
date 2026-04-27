'use client'

import { useState, useCallback, useRef } from 'react'
import type { Note } from '@/types'

interface Props {
  notes: Note[]
  currentId: string
  onNavigate: (id: string) => void
  onNewNote: () => void
}

export default function Sidebar({ notes, currentId, onNavigate, onNewNote }: Props) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Note[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((q: string) => {
    setSearch(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) {
      setResults([])
      setSearching(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (res.ok) setResults(await res.json())
    }, 200)
  }, [])

  const goToToday = () => {
    const d = new Date()
    const id = `daily-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    onNavigate(id)
  }

  const displayNotes = search.trim() ? results : notes

  return (
    <aside className="w-64 flex flex-col bg-gray-900 border-r border-gray-700 h-full flex-shrink-0">
      <div className="p-3 border-b border-gray-700 space-y-2">
        <h1 className="text-base font-semibold text-purple-400 px-1">KnowledgeGarden</h1>
        <button
          onClick={goToToday}
          className="w-full text-left px-3 py-2 rounded text-sm bg-purple-900 hover:bg-purple-800 text-purple-200 transition-colors"
        >
          📅 Today's Note
        </button>
        <button
          onClick={onNewNote}
          className="w-full text-left px-3 py-2 rounded text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
        >
          + New Note
        </button>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search notes…"
          className="w-full px-3 py-2 rounded text-sm bg-gray-800 border border-gray-600 text-gray-200 outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {search.trim() && searching && displayNotes.length === 0 && (
          <p className="text-xs text-gray-500 px-4 py-3">No results</p>
        )}
        {displayNotes.map((note) => (
          <button
            key={note.id}
            onClick={() => onNavigate(note.id)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 truncate transition-colors ${
              note.id === currentId ? 'bg-gray-700 text-white' : 'text-gray-300'
            }`}
          >
            {note.title}
          </button>
        ))}
      </div>
    </aside>
  )
}
