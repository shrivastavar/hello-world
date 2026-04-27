import { redirect } from 'next/navigation'
import { getDailyNoteId, getNote, createNote } from '@/lib/notes'

export default function Home() {
  const id = getDailyNoteId()
  if (!getNote(id)) {
    const dateStr = id.replace('daily-', '')
    createNote(`Daily Note – ${dateStr}`)
  }
  redirect(`/note/${id}`)
}
