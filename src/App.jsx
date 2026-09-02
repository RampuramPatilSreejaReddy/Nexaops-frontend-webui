import React, { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import TopNav from './components/TopNav.jsx'
import Sidebar from './components/Sidebar.jsx'
import JobStatus from './pages/JobStatus.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WorkspacePage from './pages/WorkspacePage.jsx'
import LoginPage from './pages/LoginPage.jsx'

function AppLayout({ children, user, theme, setTheme, onSignOut, sidebarCollapsed, setSidebarCollapsed, activePage, onNavigate }) {
  return (
    <div
      className={`app-theme ${theme === 'dark' ? 'dark' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', borderTop: '3px solid #2563EB' }}
    >
      <TopNav
        user={user}
        onSignOut={onSignOut}
        theme={theme}
        onToggleTheme={() => setTheme(v => v === 'dark' ? 'light' : 'dark')}
        onNavigate={onNavigate}
      />
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Sidebar
          activePage={activePage}
          onNavigate={onNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          theme={theme}
          onToggleTheme={() => setTheme(v => v === 'dark' ? 'light' : 'dark')}
        />
        <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', background: '#F4F6FA', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const [theme, setTheme] = useState(
    () => localStorage.getItem('nexaops_theme') === 'dark' ? 'dark' : 'light'
  )
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('nexaops_token')
      const stored = JSON.parse(localStorage.getItem('nexaops_user'))
      return (token && stored) ? stored : null
    } catch {
      return null
    }
  })

  const [approvedJobNames, setApprovedJobNames] = useState({})
  const resolutionCacheRef = useRef({})
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

  const activePage = location.pathname.split('/')[1] || 'jobs'
  const handleNavigate = (pageKey) => navigate(`/${pageKey}`)
  const markJobApproved = (jobName) => setApprovedJobNames(prev => ({ ...prev, [jobName]: true }))
  const handleSignOut = () => {
    localStorage.removeItem('nexaops_token')
    localStorage.removeItem('nexaops_user')
    setUser(null)
    navigate('/login')
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  const layoutProps = {
    user, theme, setTheme,
    onSignOut: handleSignOut,
    sidebarCollapsed, setSidebarCollapsed,
    activePage, onNavigate: handleNavigate
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/jobs" replace /> : <LoginPage onSuccess={(u) => { setUser(u); navigate('/jobs') }} />}
      />

      <Route path="/" element={<Navigate to="/jobs" replace />} />

      <Route
        path="/jobs"
        element={
          <AppLayout {...layoutProps}>
            <JobStatus originPage="jobs" onNavigate={handleNavigate} onApprove={markJobApproved} resolutionCache={resolutionCacheRef} />
          </AppLayout>
        }
      />
      <Route
        path="/jobs/:jobId"
        element={
          <AppLayout {...layoutProps}>
            <JobStatus originPage="jobs" onNavigate={handleNavigate} onApprove={markJobApproved} resolutionCache={resolutionCacheRef} />
          </AppLayout>
        }
      />

      <Route
        path="/incidents"
        element={
          <AppLayout {...layoutProps}>
            <WorkspacePage pageKey="incidents" onOpenJob={(jobName) => navigate(`/incidents/${encodeURIComponent(jobName)}`)} approvedJobNames={approvedJobNames} />
          </AppLayout>
        }
      />
      <Route
        path="/incidents/:jobId"
        element={
          <AppLayout {...layoutProps}>
            <JobStatus originPage="incidents" onNavigate={handleNavigate} onApprove={markJobApproved} resolutionCache={resolutionCacheRef} />
          </AppLayout>
        }
      />

      <Route path="/dashboard" element={<AppLayout {...layoutProps}><Dashboard /></AppLayout>} />
      <Route path="/integrations" element={<AppLayout {...layoutProps}><WorkspacePage pageKey="integrations" approvedJobNames={approvedJobNames} /></AppLayout>} />
      <Route path="/brain" element={<AppLayout {...layoutProps}><WorkspacePage pageKey="brain" approvedJobNames={approvedJobNames} /></AppLayout>} />
      <Route path="/runbooks" element={<AppLayout {...layoutProps}><WorkspacePage pageKey="runbooks" approvedJobNames={approvedJobNames} /></AppLayout>} />
      <Route path="/settings" element={<AppLayout {...layoutProps}><WorkspacePage pageKey="settings" approvedJobNames={approvedJobNames} /></AppLayout>} />

      <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
  )
}
