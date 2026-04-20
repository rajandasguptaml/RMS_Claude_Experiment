import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Users,
  Gift,
  Info,
  Printer,
  Search,
} from 'lucide-react'

const PRIMARY_NAV = [
  { to: '/dev/registration-tab', label: 'Registration', icon: FileText },
  { to: '/dev/guest-details-tab', label: 'Guest Details', icon: Users },
  { to: '/dev/complimentary-tab', label: 'Complimentary', icon: Gift },
  { to: '/dev/others-information-tab', label: 'Others Info', icon: Info },
]

const SECONDARY_NAV = [
  {
    to: '/front-office/room-registration/blank-registration-card',
    label: 'Blank Card',
    icon: Printer,
  },
]

export function Sidebar() {
  return (
    <aside className="z-sidebar">
      <div className="z-sidebar-brand">
        <span className="z-brand-mark" aria-hidden="true">
          C
        </span>
        <span>Cubix HMS</span>
      </div>

      <div className="z-sidebar-section">Front Office</div>
      <nav className="z-sidebar-nav" aria-label="Main">
        <NavLink to="/" end className="z-sidebar-link">
          <LayoutDashboard className="z-sidebar-icon" />
          <span>Dashboard</span>
        </NavLink>
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className="z-sidebar-link">
            <item.icon className="z-sidebar-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="z-sidebar-section">Tools</div>
        <NavLink to="/search" className="z-sidebar-link" onClick={(e) => e.preventDefault()}>
          <Search className="z-sidebar-icon" />
          <span>Search</span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 10,
              padding: '1px 6px',
              borderRadius: 999,
              background: 'var(--z-color-neutral-200)',
              color: 'var(--z-color-neutral-600)',
            }}
          >
            Soon
          </span>
        </NavLink>
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className="z-sidebar-link">
            <item.icon className="z-sidebar-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="z-sidebar-footer">
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--z-color-neutral-700)' }}>
          v13.1.0
        </div>
        <div>Room Registration module</div>
      </div>
    </aside>
  )
}
