import { StrictMode } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import App from './App'
import { theme } from './theme'
import { STORAGE_KEY } from './storage/booksStorage'

function renderApp(): ReturnType<typeof render> {
  return render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StrictMode>,
  )
}

async function addBook(
  user: ReturnType<typeof userEvent.setup>,
  title = 'Маленький принц',
): Promise<void> {
  await user.type(screen.getByLabelText(/Название книги/), title)
  await user.type(screen.getByLabelText(/Автор/), 'Антуан де Сент-Экзюпери')
  await user.click(screen.getByRole('button', { name: 'Добавить' }))
}

beforeEach(() => localStorage.clear())

describe('bookshelf user flow', () => {
  it('validates required fields and whitespace', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Добавить' }))
    expect(screen.getByText('Введите название книги.')).toBeVisible()
    expect(screen.getByText('Введите автора книги.')).toBeVisible()
    await user.type(screen.getByLabelText(/Название книги/), '   ')
    await user.click(screen.getByRole('button', { name: 'Добавить' }))
    expect(screen.queryByRole('list', { name: 'Книги на полке' })).not.toBeInTheDocument()
  })

  it('adds a book with selected status and notes into state only', async () => {
    const user = userEvent.setup()
    const write = vi.spyOn(Storage.prototype, 'setItem')
    renderApp()
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled()
    await user.click(screen.getByRole('combobox', { name: 'Статус' }))
    await user.click(screen.getByRole('option', { name: 'Читаю' }))
    await user.type(screen.getByLabelText('Заметка'), '  Перечитать летом  ')
    await addBook(user, '  Маленький принц  ')
    const list = screen.getByRole('list', { name: 'Книги на полке' })
    expect(within(list).getByRole('heading', { name: 'Маленький принц' })).toBeVisible()
    expect(within(list).getByText('Читаю')).toBeVisible()
    expect(within(list).getByText('Перечитать летом')).toBeVisible()
    expect(screen.getByLabelText(/Название книги/)).toHaveValue('')
    expect(write).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeEnabled()
  })

  it('saves on click and loads after remount only on click, without duplicates', async () => {
    const user = userEvent.setup()
    const app = renderApp()
    await addBook(user)
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(localStorage.getItem(STORAGE_KEY)).toContain('Маленький принц')
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled()
    app.unmount()
    const read = vi.spyOn(Storage.prototype, 'getItem')
    renderApp()
    expect(screen.getByText('Полка пока пуста')).toBeVisible()
    expect(read).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'Маленький принц' })).toBeVisible()
  })

  it('replaces the current list with a saved snapshot', async () => {
    const user = userEvent.setup()
    renderApp()
    await addBook(user, 'Сохранённая книга')
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))
    await addBook(user, 'Несохранённая книга')
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(
      screen.queryByRole('heading', { name: 'Несохранённая книга' }),
    ).not.toBeInTheDocument()
  })

  it('keeps current state when storage is absent or corrupt', async () => {
    const user = userEvent.setup()
    renderApp()
    await addBook(user)
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))
    expect(screen.getByText(/Сохранённой полки пока нет/)).toBeVisible()
    localStorage.setItem(STORAGE_KEY, '{broken')
    await user.click(screen.getByRole('button', { name: 'Загрузить' }))
    expect(screen.getByText(/Сохранённые данные повреждены/)).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Маленький принц' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeEnabled()
  })

  it('keeps unsaved state and allows retry after a failed save', async () => {
    const user = userEvent.setup()
    renderApp()
    await addBook(user)
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError')
    })
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(screen.getByText(/Не удалось сохранить/)).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Маленький принц' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeEnabled()
    write.mockRestore()
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(screen.getByText(/Полка сохранена в этом браузере/)).toBeVisible()
  })
})
