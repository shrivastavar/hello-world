import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KnowledgeGarden',
  description: 'A Roam-style note-taking system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
