import { BOOK_LIMITS, isBookStatus, type Book } from '../types/book'

export const STORAGE_KEY = 'my-bookshelf:v1'

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: 'missing' | 'invalid' | 'unavailable'; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

function isBook(value: unknown): value is Book {
  return (
    isRecord(value) &&
    isText(value.id, 100) &&
    isText(value.title, BOOK_LIMITS.title) &&
    isText(value.author, BOOK_LIMITS.author) &&
    isBookStatus(value.status) &&
    typeof value.notes === 'string' &&
    value.notes.length <= BOOK_LIMITS.notes
  )
}

function isBookList(value: unknown): value is Book[] {
  return (
    Array.isArray(value) &&
    value.every(isBook) &&
    new Set(value.map((book) => book.id)).size === value.length
  )
}

export function saveBooks(books: readonly Book[]): StorageResult<null> {
  if (!isBookList(books)) {
    return {
      ok: false,
      reason: 'invalid',
      message: 'Проверьте данные книг перед сохранением.',
    }
  }

  try {
    // Записываем только поля нашей схемы, а не посторонние свойства прочитанного JSON.
    const snapshot = books.map(({ id, title, author, status, notes }) => ({
      id,
      title,
      author,
      status,
      notes,
    }))
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, books: snapshot }),
    )
    return { ok: true, value: null }
  } catch {
    return {
      ok: false,
      reason: 'unavailable',
      message:
        'Не удалось сохранить. Проверьте доступ к хранилищу браузера и свободное место. Книги остались на странице.',
    }
  }
}

export function loadBooks(): StorageResult<Book[]> {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return {
      ok: false,
      reason: 'unavailable',
      message:
        'Не удалось загрузить. Разрешите хранение данных в настройках браузера и попробуйте снова.',
    }
  }

  if (raw === null) {
    return {
      ok: false,
      reason: 'missing',
      message: 'Сохранённой полки пока нет. Добавьте книги и нажмите «Сохранить».',
    }
  }

  try {
    const data: unknown = JSON.parse(raw)
    if (!isRecord(data) || data.version !== 1 || !isBookList(data.books)) {
      throw new Error('Invalid bookshelf data')
    }
    return {
      ok: true,
      value: data.books.map(({ id, title, author, status, notes }) => ({
        id,
        title,
        author,
        status,
        notes,
      })),
    }
  } catch {
    return {
      ok: false,
      reason: 'invalid',
      message:
        'Сохранённые данные повреждены или имеют неизвестный формат. Текущая полка не изменилась.',
    }
  }
}
