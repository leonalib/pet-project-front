import type { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AutoStoriesOutlined from '@mui/icons-material/AutoStoriesOutlined'
import { BOOK_STATUSES, type Book, type BookStatus } from '../types/book'

const STATUS_COLORS: Record<
  BookStatus,
  { background: string; text: string; spine: string }
> = {
  planned: { background: '#e9eff5', text: '#34566e', spine: '#7294ae' },
  reading: { background: '#f8eaf0', text: '#923b57', spine: '#b85171' },
  finished: { background: '#e8f1e9', text: '#3b6344', spine: '#8aa381' },
}

export function BookList({ books }: { books: readonly Book[] }): ReactElement {
  if (books.length === 0) {
    return (
      <Box
        sx={{
          minHeight: 380,
          display: 'grid',
          placeItems: 'center',
          border: '1px dashed',
          borderColor: '#c4d2dd',
          borderRadius: 3,
          p: 4,
          backgroundColor: '#f8fafc',
        }}
      >
        <Stack
          spacing={2}
          sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 320 }}
        >
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 96,
              height: 96,
              borderRadius: '50%',
              backgroundColor: '#e6eef4',
              mb: 1,
            }}
          >
            <AutoStoriesOutlined sx={{ fontSize: 48, color: '#627f94' }} />
          </Box>
          <Typography variant="h3" component="h3">
            Полка пока пуста
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Добавьте первую книгу через форму или загрузите сохранённую полку.
          </Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Box
      component="ul"
      aria-label="Книги на полке"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      {books.map((book) => {
        const colors = STATUS_COLORS[book.status]
        return (
          <Card
            component="li"
            key={book.id}
            sx={{
              position: 'relative',
              p: 3,
              pl: 3.5,
              borderRadius: '4px 14px 14px 4px',
              overflowWrap: 'anywhere',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 7,
                backgroundColor: colors.spine,
              },
            }}
          >
            <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Chip
                size="small"
                label={BOOK_STATUSES[book.status]}
                sx={{
                  backgroundColor: colors.background,
                  color: colors.text,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <Box>
                <Typography variant="h3" component="h3" sx={{ lineHeight: 1.45 }}>
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {book.author}
                </Typography>
              </Box>
              {book.notes ? (
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    color: 'text.secondary',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    pt: 1.5,
                    width: '100%',
                  }}
                >
                  {book.notes}
                </Typography>
              ) : null}
            </Stack>
          </Card>
        )
      })}
    </Box>
  )
}
