import { notFound } from 'next/navigation'
import { getNote, listNotes } from '@/lib/notes'
import AppLayout from '@/components/AppLayout'

interface Props {
  params: { id: string }
}

export default function NotePage({ params }: Props) {
  const note = getNote(params.id)
  if (!note) notFound()
  const allNotes = listNotes()
  return <AppLayout initialNote={note} initialNoteList={allNotes} />
}
