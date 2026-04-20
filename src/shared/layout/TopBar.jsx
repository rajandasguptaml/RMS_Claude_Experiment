import { Link, useLocation } from 'react-router-dom'
import { Bell, HelpCircle } from 'lucide-react'

const ROUTE_LABELS = {
  '/': 'Dashboard',
  '/dev/registration-tab': 'Registration',
  '/dev/guest-details-tab': 'Guest Details',
  '/dev/complimentary-tab': 'Complimentary',
  '/dev/others-information-tab': 'Others Information',
  '/front-office/room-registration/blank-registration-card': 'Blank Registration Card',
}

function Breadcrumbs() {
  const { pathname } = useLocation()
  const label = ROUTE_LABELS[pathname] || 'Room Registration'
  const isRoot = pathname === '/'

  return (
    <nav className="z-breadcrumb" aria-label="Breadcrumb">
      <Link to="/" className="z-crumb">
        Front Office
      </Link>
      {!isRoot ? (
        <>
          <span className="z-crumb-sep">/</span>
          <span className="z-crumb-current">{label}</span>
        </>
      ) : (
        <>
          <span className="z-crumb-sep">/</span>
          <span className="z-crumb-current">Dashboard</span>
        </>
      )}
    </nav>
  )
}

export function TopBar() {
  return (
    <header className="z-topbar">
      <Breadcrumbs />
      <div className="z-topbar-actions">
        <button type="button" className="z-btn z-btn-ghost" aria-label="Help">
          <HelpCircle size={16} />
        </button>
        <button type="button" className="z-btn z-btn-ghost" aria-label="Notifications">
          <Bell size={16} />
        </button>
        <span className="z-avatar" aria-label="User">
          FD
        </span>
      </div>
    </header>
  )
}
