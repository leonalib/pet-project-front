import { useState, type FormEvent, type ReactElement } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddRounded from '@mui/icons-material/AddRounded'
import { BOOK_LIMITS, BOOK_STATUSES, isBookStatus, type BookDraft } from '../types/book'

interface BookFormProps {
  onAdd: (book: BookDraft) => void
}

const EMPTY_DRAFT: BookDraft = { title: '', author: '', status: 'planned', notes: '' }

export function BookForm({ onAdd }: BookFormProps): ReactElement {
  const [draft, setDraft] = useState<BookDraft>(EMPTY_DRAFT)
  const [submitted, setSubmitted] = useState(false)
  const titleError = submitted && draft.title.trim().length === 0
  const authorError = submitted && draft.author.trim().length === 0

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setSubmitted(true)
    if (!draft.title.trim() || !draft.author.trim()) return
    onAdd({
      ...draft,
      title: draft.title.trim(),
      author: draft.author.trim(),
      notes: draft.notes.trim(),
    })
    setDraft(EMPTY_DRAFT)
    setSubmitted(false)
  }

  return (
    <Card
      component="section"
      aria-labelledby="new-book-title"
      sx={{ p: { xs: 2.5, md: 3.5 } }}
    >
      <Typography id="new-book-title" variant="h2" component="h2" sx={{ mb: 1 }}>
        Новая книга
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
        Для следующего свободного вечера.
      </Typography>
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <TextField
            label="Название книги"
            placeholder="Например, Маленький принц"
            required
            fullWidth
            value={draft.title}
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
            error={titleError}
            helperText={titleError ? 'Введите название книги.' : undefined}
            slotProps={{ htmlInput: { maxLength: BOOK_LIMITS.title } }}
          />
          <TextField
            label="Автор"
            placeholder="Имя автора"
            required
            fullWidth
            value={draft.author}
            onChange={(event) =>
              setDraft((current) => ({ ...current, author: event.target.value }))
            }
            error={authorError}
            helperText={authorError ? 'Введите автора книги.' : undefined}
            slotProps={{ htmlInput: { maxLength: BOOK_LIMITS.author } }}
          />
          <TextField
            select
            label="Статус"
            fullWidth
            value={draft.status}
            onChange={(event) => {
              const status = event.target.value
              if (isBookStatus(status)) setDraft((current) => ({ ...current, status }))
            }}
          >
            {Object.entries(BOOK_STATUSES).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Заметка"
            placeholder="Кто посоветовал? Что хочется запомнить?"
            multiline
            minRows={3}
            fullWidth
            value={draft.notes}
            onChange={(event) =>
              setDraft((current) => ({ ...current, notes: event.target.value }))
            }
            helperText="Необязательно"
            slotProps={{ htmlInput: { maxLength: BOOK_LIMITS.notes } }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<AddRounded />}
          >
            Добавить
          </Button>
        </Stack>
      </Box>
    </Card>
  )
}
