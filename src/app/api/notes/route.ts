import { NextResponse } from 'next/server'
import { listNotes, createNote } from '@/lib/notes'

export function GET() {
  try {
    return NextResponse.json(listNotes())
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json()
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })
    return NextResponse.json(createNote(title, content ?? ''), { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
