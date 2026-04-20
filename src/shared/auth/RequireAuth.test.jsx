import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RequireAuth } from './RequireAuth.jsx'

vi.mock('./useSession.js', () => ({
  useSession: vi.fn(),
}))
import { useSession } from './useSession.js'

function renderWithRouter(startPath) {
  return render(
    <MemoryRouter initialEntries={[startPath]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <div>protected content</div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    useSession.mockReset()
  })

  it('renders children when authenticated', () => {
    useSession.mockReturnValue({ authenticated: true, user: null })
    renderWithRouter('/protected')
    expect(screen.getByText('protected content')).toBeInTheDocument()
    expect(screen.queryByText('login page')).not.toBeInTheDocument()
  })

  it('redirects to /login when unauthenticated', () => {
    useSession.mockReturnValue({ authenticated: false, user: null })
    renderWithRouter('/protected')
    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(screen.queryByText('protected content')).not.toBeInTheDocument()
  })

  it('honours custom redirectTo prop', () => {
    useSession.mockReturnValue({ authenticated: false, user: null })
    render(
      <MemoryRouter initialEntries={['/custom']}>
        <Routes>
          <Route
            path="/custom"
            element={
              <RequireAuth redirectTo="/sso">
                <div>should not render</div>
              </RequireAuth>
            }
          />
          <Route path="/sso" element={<div>sso page</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('sso page')).toBeInTheDocument()
  })
})
