import React, { useEffect, useState } from 'react'
import TopNav from './components/TopNav.jsx'
import Sidebar from './components/Sidebar.jsx'
import JobStatus from './pages/JobStatus.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WorkspacePage from './pages/WorkspacePage.jsx'
import SignInModal from './components/SignInModal.jsx'

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('nexaops_theme') === 'dark' ? 'dark' : 'light'
  )
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexaops_user')) || null }
    catch { return null }
  })
  const [showSignIn, setShowSignIn] = useState(false)
  const [activePage, setActivePage] = useState('jobs')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('nexaops_sidebar_collapsed') === 'true'
  )

  useEffect(() => {
    localStorage.setItem('nexaops_sidebar_collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    localStorage.setItem('nexaops_theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div
      className={`app-theme ${theme === 'dark' ? 'dark' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        borderTop: '3px solid #2563EB',
      }}
    >
      <TopNav
        user={user}
        onSignIn={() => setShowSignIn(true)}
        onSignOut={() => {
          localStorage.removeItem('nexaops_token')
          localStorage.removeItem('nexaops_user')
          setUser(null)
        }}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          theme={theme}
          onToggleTheme={() => setTheme(v => v === 'dark' ? 'light' : 'dark')}
        />

        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: '#F4F6FA',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {activePage === 'jobs'      && <JobStatus />}
          {activePage === 'dashboard' && <Dashboard />}
          {['incidents', 'integrations'].includes(activePage) && (
            <WorkspacePage pageKey={activePage} />
          )}
        </main>
      </div>

      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSuccess={(u) => {
            localStorage.setItem('nexaops_user', JSON.stringify(u))
            setUser(u)
            setShowSignIn(false)
          }}
        />
      )}
    </div>
  )
}
