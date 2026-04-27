import { NextResponse } from 'next/server'
import { searchNotes } from '@/lib/notes'

export function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') ?? ''
    if (!q.trim()) return NextResponse.json([])
    return NextResponse.json(searchNotes(q.trim()))
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
