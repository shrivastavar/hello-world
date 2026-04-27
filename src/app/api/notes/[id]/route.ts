import { NextResponse } from 'next/server'
import { getNote, updateNote, deleteNote } from '@/lib/notes'

export function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const note = getNote(params.id)
    if (!note) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json(note)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { title, content } = await req.json()
    const note = updateNote(params.id, title, content)
    if (!note) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json(note)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const ok = deleteNote(params.id)
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
