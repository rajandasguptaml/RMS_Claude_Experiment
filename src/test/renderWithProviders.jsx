import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { MemoryRouter } from 'react-router-dom'

const theme = createTheme()

/**
 * Wrap a UI in the same provider stack used at runtime.
 * A fresh QueryClient is created per render with retries disabled so tests fail fast.
 *
 * @param {import('react').ReactNode} ui
 * @param {{ initialEntries?: string[] }} [options]
 */
export function renderWithProviders(ui, options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
  const { initialEntries = ['/'] } = options
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
  return { ...utils, queryClient }
}
