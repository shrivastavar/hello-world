export interface Note {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface NoteWithBacklinks extends Note {
  backlinks: { id: string; title: string }[]
}
