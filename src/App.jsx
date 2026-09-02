import React, { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import TopNav from './components/TopNav.jsx'
import Sidebar from './components/Sidebar.jsx'
import JobStatus from './pages/JobStatus.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WorkspacePage from './pages/WorkspacePage.jsx'
import LoginPage from './pages/LoginPage.jsx'

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

  // Determine active sidebar key from current route
  const getActiveKey = () => {
    const path = location.pathname.split('/')[1] || 'jobs'
    return path
  }

  const handleNavigate = (pageKey) => {
    navigate(`/${pageKey}`)
  }

  const markJobApproved = (jobName) => {
    setApprovedJobNames(prev => ({ ...prev, [jobName]: true }))
  }

  const handleSignOut = () => {
    localStorage.removeItem('nexaops_token')
    localStorage.removeItem('nexaops_user')
    setUser(null)
    navigate('/login')
  }

  // Unauthenticated protection
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/jobs" replace />
          ) : (
            <LoginPage
              onSuccess={(u) => {
                setUser(u)
                navigate('/jobs')
              }}
            />
          )
        }
      />

      {/* Main Workspace Layout */}
      <Route
        path="/*"
        element={
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
              onNavigate={handleNavigate}
            />

            <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <Sidebar
                activePage={getActiveKey()}
                onNavigate={handleNavigate}
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
                <Routes>
                  <Route path="/" element={<Navigate to="/jobs" replace />} />
                  <Route
                    path="/jobs"
                    element={
                      <JobStatus
                        originPage="jobs"
                        onNavigate={handleNavigate}
                        onApprove={markJobApproved}
                        resolutionCache={resolutionCacheRef}
                      />
                    }
                  />
                  <Route
                    path="/jobs/:jobId"
                    element={
                      <JobStatus
                        originPage="jobs"
                        onNavigate={handleNavigate}
                        onApprove={markJobApproved}
                        resolutionCache={resolutionCacheRef}
                      />
                    }
                  />
                  <Route
                    path="/incidents"
                    element={
                      <WorkspacePage
                        pageKey="incidents"
                        onOpenJob={(jobName) => navigate(`/incidents/${encodeURIComponent(jobName)}`)}
                        approvedJobNames={approvedJobNames}
                      />
                    }
                  />
                  <Route
                    path="/incidents/:jobId"
                    element={
                      <JobStatus
                        originPage="incidents"
                        onNavigate={handleNavigate}
                        onApprove={markJobApproved}
                        resolutionCache={resolutionCacheRef}
                      />
                    }
                  />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route
                    path="/integrations"
                    element={
                      <WorkspacePage
                        pageKey="integrations"
                        approvedJobNames={approvedJobNames}
                      />
                    }
                  />
                  <Route
                    path="/brain"
                    element={
                      <WorkspacePage
                        pageKey="brain"
                        approvedJobNames={approvedJobNames}
                      />
                    }
                  />
                  <Route
                    path="/runbooks"
                    element={
                      <WorkspacePage
                        pageKey="runbooks"
                        approvedJobNames={approvedJobNames}
                      />
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <WorkspacePage
                        pageKey="settings"
                        approvedJobNames={approvedJobNames}
                      />
                    }
                  />
                  <Route path="*" element={<Navigate to="/jobs" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        }
      />
    </Routes>
  )
}
