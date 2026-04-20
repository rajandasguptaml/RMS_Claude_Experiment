import { Routes, Route, Link } from 'react-router-dom'
import { ArrowRight, FileText, Users, Gift, Info, Printer } from 'lucide-react'
import {
  RegistrationTab,
  ComplimentaryTab,
  OthersInformationTab,
  GuestDetailsTab,
} from './features/registration/index.js'
import { BlankRegistrationCard } from './features/registration/pages/BlankRegistrationCard.jsx'
import { RequireAuth } from './shared/auth/RequireAuth.jsx'
import { AppShell } from './shared/layout/AppShell.jsx'
import { Card } from './shared/ui/Card.jsx'

const QUICK_LINKS = [
  {
    to: '/dev/registration-tab',
    label: 'Registration',
    desc: 'Create a new room registration',
    icon: FileText,
  },
  {
    to: '/dev/guest-details-tab',
    label: 'Guest Details',
    desc: 'Capture guest profile and documents',
    icon: Users,
  },
  {
    to: '/dev/complimentary-tab',
    label: 'Complimentary',
    desc: 'Select package-included services',
    icon: Gift,
  },
  {
    to: '/dev/others-information-tab',
    label: 'Others Information',
    desc: 'Classification and card guarantee',
    icon: Info,
  },
  {
    to: '/front-office/room-registration/blank-registration-card',
    label: 'Blank Card',
    desc: 'Printable pre-registration form',
    icon: Printer,
  },
]

function Home() {
  return (
    <>
      <div className="z-page-header">
        <div>
          <h1 className="z-page-title">Front Office</h1>
          <div className="z-page-subtitle">
            Room Registration module — pick a workspace to continue.
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
        }}
      >
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'var(--z-color-primary-50)',
                    color: 'var(--z-color-primary-700)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  <item.icon size={18} />
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--z-color-neutral-800)',
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--z-color-neutral-500)' }}>
                    {item.desc}
                  </div>
                </div>
                <ArrowRight size={16} color="var(--z-color-neutral-400)" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}

function App() {
  return (
    <Routes>
      {/* Print-only route — renders outside the app shell for clean printing */}
      <Route
        path="/front-office/room-registration/blank-registration-card"
        element={
          <RequireAuth>
            <BlankRegistrationCard />
          </RequireAuth>
        }
      />

      {/* All other routes render inside the Zoho-style app shell */}
      <Route
        path="*"
        element={
          <AppShell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dev/registration-tab" element={<RegistrationTab />} />
              <Route path="/dev/complimentary-tab" element={<ComplimentaryTab />} />
              <Route path="/dev/others-information-tab" element={<OthersInformationTab />} />
              <Route path="/dev/guest-details-tab" element={<GuestDetailsTab />} />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  )
}

export default App
