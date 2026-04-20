import { Sidebar } from './Sidebar.jsx'
import { TopBar } from './TopBar.jsx'

export function AppShell({ children }) {
  return (
    <div className="z-app-bg">
      <div className="z-app-shell">
        <Sidebar />
        <TopBar />
        <main className="z-content">{children}</main>
      </div>
    </div>
  )
}
