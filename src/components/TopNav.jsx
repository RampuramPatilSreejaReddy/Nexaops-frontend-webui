import React, { useState, useRef, useEffect } from 'react'
import { Bell, Command, LogIn, Moon, Search, ShieldCheck, Sun, UserRound, X } from 'lucide-react'

const S = {
  nav: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 16px',
    background: 'linear-gradient(90deg, #0A1628 0%, #0F2040 50%, #0D1A34 100%)',
    borderBottom: '1px solid rgba(30,45,70,0.9)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    position: 'relative',
    zIndex: 30,
    flexShrink: 0,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, marginRight: 4, flexShrink: 0,
  },
  logoIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: 'rgba(59,130,246,0.15)',
    border: '1px solid rgba(96,165,250,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#93C5FD',
  },
  logoText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 15, fontWeight: 500,
    color: '#F1F5F9', letterSpacing: '-0.02em',
  },
  prodBadge: {
    fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
    background: 'rgba(239,68,68,0.12)',
    color: '#FCA5A5',
    border: '1px solid rgba(239,68,68,0.2)',
    padding: '2px 7px', borderRadius: 5,
  },
  divider: { width: 1, height: 18, background: 'rgba(100,116,139,0.4)', margin: '0 4px' },
  searchWrap: { position: 'relative', flex: 1, maxWidth: 380 },
  searchInput: {
    width: '100%', height: 36,
    background: 'rgba(30,42,65,0.8)',
    border: '1px solid rgba(71,85,105,0.5)',
    borderRadius: 8,
    padding: '0 40px 0 36px',
    fontSize: 12, color: '#CBD5E1',
    outline: 'none',
    transition: 'border-color 150ms, background 150ms',
    fontFamily: 'inherit',
  },
  searchIcon: { position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' },
  kbd: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    display: 'flex', alignItems: 'center', gap: 2,
    fontSize: 9, color: '#475569',
    border: '1px solid #334155', borderRadius: 4,
    padding: '2px 5px', lineHeight: 1.2,
  },
  rightGroup: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 },
  livePill: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, color: '#94A3B8',
    border: '1px solid rgba(71,85,105,0.5)',
    padding: '5px 10px', borderRadius: 8,
    background: 'rgba(30,42,65,0.3)',
  },
  liveDot: { width: 6, height: 6, borderRadius: '50%', background: '#34D399', flexShrink: 0 },
  incidentPill: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 600,
    padding: '5px 10px', borderRadius: 8,
    background: 'rgba(239,68,68,0.10)',
    color: '#FCA5A5',
    border: '1px solid rgba(239,68,68,0.15)',
  },
  incDot: { width: 6, height: 6, borderRadius: '50%', background: '#F87171', flexShrink: 0 },
  iconBtn: {
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, color: '#64748B', background: 'transparent', border: 'none',
    cursor: 'pointer', position: 'relative', transition: 'background 150ms, color 150ms',
  },
  notifDot: {
    position: 'absolute', top: 6, right: 6, width: 6, height: 6,
    borderRadius: '50%', background: '#60A5FA',
    border: '2px solid #0A1628',
  },
  signInBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 600,
    background: '#2563EB', color: '#fff',
    padding: '6px 12px', borderRadius: 8,
    border: 'none', cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(37,99,235,0.3)',
    transition: 'background 150ms',
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(59,130,246,0.15)',
    color: '#93C5FD',
    border: '1px solid rgba(96,165,250,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
    transition: 'background 150ms',
  },
  notifPanel: {
    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
    width: 310, borderRadius: 12,
    background: '#fff',
    border: '1px solid #E2E8F0',
    boxShadow: '0 20px 50px rgba(15,23,42,0.18)',
    zIndex: 50,
    overflow: 'hidden',
  },
}

export default function TopNav({ user, onSignIn, onSignOut, theme, onToggleTheme }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false) }
    if (notifOpen) document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [notifOpen])

  return (
    <nav style={S.nav}>
      {/* Logo */}
      <div style={S.logo}>
        <div style={S.logoIcon}><ShieldCheck size={16} strokeWidth={2.2} /></div>
        <span style={S.logoText}>Nexa<span style={{ color: '#60A5FA', fontWeight: 600 }}>Ops</span></span>
        <span style={S.prodBadge}>PROD</span>
      </div>

      <div style={S.divider} />

      {/* Search */}
      <div style={S.searchWrap}>
        <Search size={14} style={S.searchIcon} />
        <input
          style={S.searchInput}
          placeholder="Search jobs, incidents, workflows…"
          aria-label="Global search"
          onFocus={e => { e.target.style.borderColor = 'rgba(96,165,250,0.6)'; e.target.style.background = 'rgba(30,42,65,1)' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(71,85,105,0.5)'; e.target.style.background = 'rgba(30,42,65,0.8)' }}
        />
        <span style={S.kbd}><Command size={9} /> K</span>
      </div>

      {/* Right side */}
      <div style={S.rightGroup}>
        <div style={S.livePill}>
          <span style={{ ...S.liveDot, animation: 'blink 2s ease-in-out infinite' }} />
          Live
        </div>

        <div style={S.incidentPill}>
          <span style={{ ...S.incDot, animation: 'blink 1.2s ease-in-out infinite' }} />
          2 Incidents
        </div>

        {/* Theme toggle */}
        {onToggleTheme && (
          <button
            style={S.iconBtn}
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(71,85,105,0.4)'; e.currentTarget.style.color = '#E2E8F0' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' }}
          >
            {theme === 'dark' ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
          </button>
        )}

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            style={S.iconBtn}
            onClick={() => setNotifOpen(v => !v)}
            aria-label="Notifications"
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(71,85,105,0.4)'; e.currentTarget.style.color = '#E2E8F0' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' }}
          >
            <Bell size={17} strokeWidth={1.8} />
            <span style={S.notifDot} />
          </button>

          {notifOpen && (
            <div style={S.notifPanel}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Notifications</span>
                  <span style={{ fontSize: 9, fontWeight: 700, background: '#EFF6FF', color: '#2563EB', padding: '2px 7px', borderRadius: 10 }}>3 new</span>
                </div>
                <button onClick={() => setNotifOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', padding: 4, borderRadius: 4 }}>
                  <X size={14} />
                </button>
              </div>
              <div style={{ padding: '6px' }}>
                <NotifItem color="#EF4444" title="P1 incident requires review" sub="customer-sync-api · 8 minutes ago" />
                <NotifItem color="#3B82F6" title="AI fix ready for approval" sub="BigQuery schema mismatch · INC-2048" />
                <NotifItem color="#10B981" title="Daily report generated" sub="Dashboard · Available now" />
              </div>
              <button style={{ width: '100%', borderTop: '1px solid #F1F5F9', padding: '10px', fontSize: 11, fontWeight: 600, color: '#2563EB', background: 'transparent', border: 'none', cursor: 'pointer', borderTop: '1px solid #F1F5F9' }}>
                View all activity →
              </button>
            </div>
          )}
        </div>

        {/* User */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{user.name}</span>
            <button onClick={onSignOut} style={{ fontSize: 11, color: '#94A3B8', border: '1px solid #334155', padding: '5px 10px', borderRadius: 8, background: 'transparent', cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={onSignIn} style={S.signInBtn}
            onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
          >
            <LogIn size={13} strokeWidth={2.2} /> Sign In
          </button>
        )}

        <div onClick={onSignIn} style={S.avatar}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}
        >
          {user ? user.name?.slice(0, 2).toUpperCase() : <UserRound size={15} strokeWidth={1.8} />}
        </div>
      </div>
    </nav>
  )
}

function NotifItem({ color, title, sub }) {
  return (
    <button style={{ width: '100%', display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 150ms' }}
      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 5 }} />
      <span>
        <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#1E293B' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{sub}</span>
      </span>
    </button>
  )
}
