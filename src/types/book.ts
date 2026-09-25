export const BOOK_STATUSES = {
  planned: 'Хочу прочитать',
  reading: 'Читаю',
  finished: 'Прочитано',
} as const

export type BookStatus = keyof typeof BOOK_STATUSES

export interface BookDraft {
  title: string
  author: string
  status: BookStatus
  notes: string
}

export interface Book extends BookDraft {
  id: string
}

export const BOOK_LIMITS = { title: 160, author: 120, notes: 1000 } as const

export function isBookStatus(value: unknown): value is BookStatus {
  return value === 'planned' || value === 'reading' || value === 'finished'
}
