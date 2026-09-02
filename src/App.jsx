import React, { useEffect, useRef, useState } from 'react'
import TopNav from './components/TopNav.jsx'
import Sidebar from './components/Sidebar.jsx'
import JobStatus from './pages/JobStatus.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WorkspacePage from './pages/WorkspacePage.jsx'
import LoginPage from './pages/LoginPage.jsx'

export default function App() {
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
  const [activePage, setActivePage] = useState('jobs')
  const [pendingJobName, setPendingJobName] = useState(null)
  const [jobOriginPage, setJobOriginPage] = useState('jobs')
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

  const openJobFromIncident = (jobName, fromPage = 'incidents') => {
    setPendingJobName(jobName)
    setJobOriginPage(fromPage)
    setActivePage('jobs')
  }

  const handleReturnFromJob = () => {
    setPendingJobName(null)
    if (jobOriginPage && jobOriginPage !== 'jobs') {
      setActivePage(jobOriginPage)
    }
  }

  const markJobApproved = (jobName) => {
    setApprovedJobNames(prev => ({ ...prev, [jobName]: true }))
  }

  const handleSignOut = () => {
    localStorage.removeItem('nexaops_token')
    localStorage.removeItem('nexaops_user')
    setUser(null)
  }

  // Require login: show full Login Page if unauthenticated
  if (!user) {
    return <LoginPage onSuccess={(u) => setUser(u)} />
  }

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
        onSignOut={handleSignOut}
        theme={theme}
        onToggleTheme={() => setTheme(v => v === 'dark' ? 'light' : 'dark')}
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
          {activePage === 'jobs' && (
            <JobStatus
              initialJobName={pendingJobName}
              originPage={jobOriginPage}
              onConsumeInitialJob={() => setPendingJobName(null)}
              onReturnToOrigin={handleReturnFromJob}
              onNavigate={setActivePage}
              onApprove={markJobApproved}
              resolutionCache={resolutionCacheRef}
            />
          )}
          {activePage === 'dashboard' && <Dashboard />}
          {['incidents', 'integrations', 'brain', 'runbooks', 'settings'].includes(activePage) && (
            <WorkspacePage
              pageKey={activePage}
              onOpenJob={openJobFromIncident}
              approvedJobNames={approvedJobNames}
            />
          )}
        </main>
      </div>
    </div>
  )
}
