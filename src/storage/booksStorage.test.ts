import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Book } from '../types/book'
import { loadBooks, saveBooks, STORAGE_KEY } from './booksStorage'

const book: Book = {
  id: 'book-1',
  title: 'Маленький принц',
  author: 'Антуан де Сент-Экзюпери',
  status: 'reading',
  notes: 'Вернуться к любимой истории.',
}

beforeEach(() => localStorage.clear())

describe('books storage', () => {
  it('round-trips a versioned snapshot without touching other keys', () => {
    localStorage.setItem('another-app', 'keep me')
    expect(saveBooks([book])).toEqual({ ok: true, value: null })
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual({
      version: 1,
      books: [book],
    })
    expect(loadBooks()).toEqual({ ok: true, value: [book] })
    expect(localStorage.getItem('another-app')).toBe('keep me')
  })

  it('supports an empty saved bookshelf', () => {
    expect(saveBooks([]).ok).toBe(true)
    expect(loadBooks()).toEqual({ ok: true, value: [] })
  })

  it('distinguishes missing storage from an empty saved bookshelf', () => {
    expect(loadBooks()).toMatchObject({ ok: false, reason: 'missing' })
  })

  it.each([
    '{broken',
    'null',
    '[]',
    JSON.stringify({ version: 2, books: [book] }),
    JSON.stringify({ version: 1, books: {} }),
    JSON.stringify({ version: 1, books: [{ ...book, title: '  ' }] }),
    JSON.stringify({ version: 1, books: [{ ...book, author: 17 }] }),
    JSON.stringify({ version: 1, books: [{ ...book, status: 'unknown' }] }),
    JSON.stringify({ version: 1, books: [{ ...book, notes: null }] }),
    JSON.stringify({ version: 1, books: [{ ...book, id: '' }] }),
    JSON.stringify({ version: 1, books: [{ ...book, title: 'a'.repeat(161) }] }),
    JSON.stringify({ version: 1, books: [book, book] }),
  ])('rejects invalid data and preserves the stored original: %s', (raw) => {
    localStorage.setItem(STORAGE_KEY, raw)
    expect(loadBooks()).toMatchObject({ ok: false, reason: 'invalid' })
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw)
  })

  it('strips unknown properties when loading', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, books: [{ ...book, extra: true }] }),
    )
    expect(loadBooks()).toEqual({ ok: true, value: [book] })
  })

  it('does not overwrite a saved snapshot with invalid books', () => {
    saveBooks([book])
    expect(saveBooks([{ ...book, title: ' ' }])).toMatchObject({
      ok: false,
      reason: 'invalid',
    })
    expect(loadBooks()).toEqual({ ok: true, value: [book] })
  })

  it('handles a full or blocked storage', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError')
    })
    expect(saveBooks([book])).toMatchObject({ ok: false, reason: 'unavailable' })
  })

  it('handles blocked reads', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    expect(loadBooks()).toMatchObject({ ok: false, reason: 'unavailable' })
  })

  it('handles a blocked localStorage property getter', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    expect(loadBooks()).toMatchObject({ ok: false, reason: 'unavailable' })
    expect(saveBooks([book])).toMatchObject({ ok: false, reason: 'unavailable' })
  })
})
