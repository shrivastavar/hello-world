'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { EditorView, ViewPlugin, ViewUpdate, Decoration, DecorationSet } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import type { NoteWithBacklinks } from '@/types'

const WIKI_RE = /\[\[([^\]]+)\]\]/g

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  for (const { from, to } of view.visibleRanges) {
    const text = view.state.doc.sliceString(from, to)
    WIKI_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = WIKI_RE.exec(text)) !== null) {
      builder.add(
        from + m.index,
        from + m.index + m[0].length,
        Decoration.mark({ class: 'wiki-link' }),
      )
    }
  }
  return builder.finish()
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface Props {
  note: NoteWithBacklinks
  onSave: (title: string, content: string) => void
  onNavigate: (id: string) => void
}

export default function NoteEditor({ note, onSave, onNavigate }: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const navigateRef = useRef(onNavigate)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    navigateRef.current = onNavigate
  }, [onNavigate])

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    if (saveTimer.current) clearTimeout(saveTimer.current)
  }, [note.id])

  const scheduleSave = useCallback(
    (t: string, c: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => onSave(t, c), 1000)
    },
    [onSave],
  )

  const extensions = useMemo(
    () => [
      markdown(),
      ViewPlugin.fromClass(
        class {
          decorations: DecorationSet
          constructor(view: EditorView) {
            this.decorations = buildDecorations(view)
          }
          update(u: ViewUpdate) {
            if (u.docChanged || u.viewportChanged) this.decorations = buildDecorations(u.view)
          }
        },
        { decorations: (v) => v.decorations },
      ),
      EditorView.domEventHandlers({
        click(event, view) {
          const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
          if (pos === null) return false
          const text = view.state.doc.toString()
          WIKI_RE.lastIndex = 0
          let m: RegExpExecArray | null
          while ((m = WIKI_RE.exec(text)) !== null) {
            if (pos >= m.index && pos <= m.index + m[0].length) {
              navigateRef.current(slugify(m[1]))
              return true
            }
          }
          return false
        },
      }),
      EditorView.theme({
        '&': { background: 'transparent !important', height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': { padding: '2rem', minHeight: '100%' },
        '.cm-line': { color: '#e0e0e0', lineHeight: '1.75' },
        '.cm-cursor': { borderLeftColor: '#7b68ee' },
        '.cm-selectionBackground': { background: '#3d3580 !important' },
      }),
    ],
    [],
  )

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-8 pb-4 border-b border-gray-700 flex-shrink-0">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            scheduleSave(e.target.value, content)
          }}
          className="w-full text-3xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-500"
          placeholder="Untitled"
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          key={note.id}
          value={content}
          height="100%"
          theme="dark"
          extensions={extensions}
          onChange={(val) => {
            setContent(val)
            scheduleSave(title, val)
          }}
          basicSetup={{ lineNumbers: false, foldGutter: false }}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  )
}
