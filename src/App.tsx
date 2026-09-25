import { useState, type ReactElement } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AutoStoriesOutlined from '@mui/icons-material/AutoStoriesOutlined'
import BookmarkBorderRounded from '@mui/icons-material/BookmarkBorderRounded'
import SaveOutlined from '@mui/icons-material/SaveOutlined'
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined'
import { BookForm } from './components/BookForm'
import { BookList } from './components/BookList'
import { loadBooks, saveBooks } from './storage/booksStorage'
import type { Book, BookDraft } from './types/book'

interface Notice {
  severity: 'success' | 'info' | 'error'
  text: string
}

function ShelfIllustration(): ReactElement {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: 260,
        height: 170,
        position: 'relative',
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        mr: 5,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 0,
          right: 0,
          height: 8,
          bgcolor: '#cbd8e2',
          borderRadius: 2,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 18,
          left: 24,
          width: 47,
          height: 135,
          bgcolor: '#6e91ab',
          borderRadius: '4px 8px 0 0',
          boxShadow: 'inset 6px 0 rgba(0,0,0,0.08)',
          borderTop: '8px solid #9db5c7',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 18,
          left: 76,
          width: 39,
          height: 114,
          bgcolor: '#9eaf8b',
          borderRadius: '4px 6px 0 0',
          boxShadow: 'inset 5px 0 rgba(0,0,0,0.07)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 18,
          left: 121,
          width: 43,
          height: 145,
          bgcolor: '#284b63',
          borderRadius: '3px 8px 0 0',
          boxShadow: 'inset 6px 0 rgba(0,0,0,0.1)',
          transform: 'rotate(-10deg)',
          transformOrigin: 'bottom left',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 28,
            left: 11,
            width: 19,
            height: 35,
            border: '1px solid #7690a3',
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 18,
          left: 183,
          width: 45,
          height: 101,
          bgcolor: '#ae4b67',
          borderRadius: '4px 8px 0 0',
          transform: 'rotate(12deg)',
          transformOrigin: 'bottom left',
          boxShadow: 'inset 5px 0 rgba(0,0,0,0.08)',
        }}
      />
    </Box>
  )
}

function App(): ReactElement {
  // State живёт в памяти. Хранилище изменяется только обработчиками кнопок ниже.
  const [books, setBooks] = useState<Book[]>([])
  const [notice, setNotice] = useState<Notice | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  function handleAddBook(draft: BookDraft): void {
    const book: Book = { ...draft, id: crypto.randomUUID() }
    setBooks((current) => [...current, book])
    setHasUnsavedChanges(true)
    setNotice({
      severity: 'info',
      text: `«${book.title}» добавлена. Нажмите «Сохранить», чтобы оставить книгу в браузере.`,
    })
  }

  function handleSaveBooks(): void {
    const result = saveBooks(books)
    if (!result.ok) {
      setNotice({ severity: 'error', text: result.message })
      return
    }
    setHasUnsavedChanges(false)
    setNotice({
      severity: 'success',
      text: 'Полка сохранена в этом браузере. После обновления страницы нажмите «Загрузить».',
    })
  }

  function handleLoadBooks(): void {
    const result = loadBooks()
    if (!result.ok) {
      setNotice({
        severity: result.reason === 'missing' ? 'info' : 'error',
        text: result.message,
      })
      return
    }
    setBooks(result.value)
    setHasUnsavedChanges(false)
    setNotice({ severity: 'success', text: 'Сохранённая полка загружена.' })
  }

  return (
    <>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#ffffffb3',
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <AutoStoriesOutlined color="primary" sx={{ fontSize: 29 }} />
            <Typography sx={{ fontWeight: 600, fontSize: 20, letterSpacing: '-0.7px' }}>
              Моя полка
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Ваша маленькая библиотека
          </Typography>
        </Container>
      </Box>
      <Container component="main" maxWidth="lg" sx={{ pb: 6 }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            py: { xs: 4, md: 6 },
          }}
        >
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 39, sm: 52, md: 62 },
                lineHeight: 1.12,
                letterSpacing: '-2px',
                mb: 2,
              }}
            >
              Всё, что хочется
              <br />
              прочитать.
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ maxWidth: 440, fontSize: { xs: 14, sm: 16 } }}
            >
              Собирайте книги, отмечайте прочитанное
              <br />и оставляйте мысли между строк.
            </Typography>
          </Box>
          <ShelfIllustration />
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '350px minmax(0, 1fr)' },
            gap: { xs: 3, md: 4 },
            alignItems: 'start',
          }}
        >
          <BookForm onAdd={handleAddBook} />
          <Box component="section" aria-labelledby="bookshelf-title" sx={{ minWidth: 0 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'space-between', mb: 2 }}
            >
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                <Typography variant="h2" component="h2" id="bookshelf-title">
                  На моей полке
                </Typography>
                <Chip
                  label={books.length}
                  aria-label={`Книг на полке: ${books.length}`}
                  size="small"
                  sx={{ bgcolor: '#e0e9f0', minWidth: 28, fontWeight: 500 }}
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadOutlined />}
                  onClick={handleLoadBooks}
                  sx={{ px: 1.5 }}
                >
                  Загрузить
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveOutlined />}
                  onClick={handleSaveBooks}
                  disabled={!hasUnsavedChanges}
                  sx={{ px: 1.5 }}
                >
                  Сохранить
                </Button>
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {hasUnsavedChanges
                ? 'Есть несохранённые изменения. Загрузка заменит текущий список.'
                : 'Сохраните полку, чтобы вернуться к ней позже.'}
            </Typography>
            <Box aria-live="polite" aria-atomic="true">
              {notice ? (
                <Alert
                  closeText="Закрыть сообщение"
                  severity={notice.severity}
                  onClose={() => setNotice(null)}
                  sx={{ mb: 2.5, overflowWrap: 'anywhere' }}
                >
                  {notice.text}
                </Alert>
              ) : null}
            </Box>
            <BookList books={books} />
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'flex-start', mt: 2.5, color: 'text.secondary' }}
            >
              <BookmarkBorderRounded sx={{ fontSize: 19, mt: 0.3 }} />
              <Typography variant="caption" sx={{ lineHeight: 1.7 }}>
                Книги сохраняются только по кнопке, в этом браузере.
                <br />
                После обновления страницы нажмите «Загрузить».
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Container>
      <Container
        component="footer"
        maxWidth="lg"
        sx={{ borderTop: '1px solid', borderColor: 'divider', py: 2.5 }}
      >
        <Typography variant="caption" color="text.secondary">
          Моя полка. Место для историй, которые остаются с вами.
        </Typography>
      </Container>
    </>
  )
}

export default App
