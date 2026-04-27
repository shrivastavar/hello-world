'use client'

import { useState } from 'react'

interface Props {
  backlinks: { id: string; title: string }[]
  onNavigate: (id: string) => void
}

export default function BacklinksPanel({ backlinks, onNavigate }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <aside className="w-64 flex flex-col bg-gray-900 border-l border-gray-700 h-full flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-4 py-3 border-b border-gray-700 text-sm font-medium text-gray-300 hover:text-white transition-colors w-full"
      >
        <span>Backlinks ({backlinks.length})</span>
        <span className="text-xs">{open ? '▼' : '▶'}</span>
      </button>

      {open && (
        <div className="flex-1 overflow-y-auto p-2">
          {backlinks.length === 0 ? (
            <p className="text-xs text-gray-500 px-2 py-4 text-center">No backlinks yet</p>
          ) : (
            backlinks.map((bl) => (
              <button
                key={bl.id}
                onClick={() => onNavigate(bl.id)}
                className="w-full text-left px-3 py-2 rounded text-sm text-purple-300 hover:bg-gray-700 hover:text-purple-200 transition-colors"
              >
                {bl.title}
              </button>
            ))
          )}
        </div>
      )}
    </aside>
  )
}
