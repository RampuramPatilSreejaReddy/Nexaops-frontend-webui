import React from 'react'
import { Activity, AlertTriangle, BarChart3, Menu, Moon, PlugZap, Sun } from 'lucide-react'

const NAV = [
  { key: 'jobs',      icon: Activity,      label: 'Job Status',  badge: false },
  { key: 'incidents', icon: AlertTriangle,  label: 'Incidents',   badge: true  },
  { key: 'dashboard', icon: BarChart3,      label: 'Dashboard',   badge: false },
]
const BOTTOM = [
  { key: 'integrations', icon: PlugZap, label: 'Integrations' },
]

const S = {
  aside: (collapsed) => ({
    width: collapsed ? 56 : 172,
    flexShrink: 0,
    background: '#FFFFFF',
    borderRight: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 8px',
    gap: 2,
    transition: 'width 200ms ease-in-out',
    overflow: 'hidden',
  }),
  header: (collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'space-between',
    height: 32,
    marginBottom: 12,
    padding: collapsed ? 0 : '0 4px',
  }),
  sectionLabel: {
    fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#94A3B8',
    whiteSpace: 'nowrap', paddingLeft: 4,
  },
  toggleBtn: {
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, border: 'none', background: 'transparent',
    color: '#94A3B8', cursor: 'pointer', flexShrink: 0,
    transition: 'background 150ms, color 150ms',
  },
  navBtn: (active, collapsed) => ({
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    gap: collapsed ? 0 : 10,
    padding: collapsed ? '10px 0' : '9px 12px',
    borderRadius: 8,
    border: 'none',
    background: active ? '#EFF6FF' : 'transparent',
    color: active ? '#1D4ED8' : '#64748B',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: active ? 600 : 500,
    transition: 'background 150ms, color 150ms',
    textAlign: 'left',
    boxShadow: active ? 'inset 0 0 0 1px rgba(96,165,250,0.25)' : 'none',
  }),
  activeBar: {
    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
    width: 3, height: 20, borderRadius: '0 3px 3px 0',
    background: '#2563EB',
  },
  badgeDot: (collapsed) => ({
    position: 'absolute',
    top: collapsed ? 6 : 9,
    right: collapsed ? 4 : 10,
    width: 7, height: 7, borderRadius: '50%',
    background: '#EF4444',
    border: '2px solid #fff',
  }),
  label: { whiteSpace: 'nowrap', overflow: 'hidden' },
  divider: (collapsed) => ({
    height: 1, background: '#F1F5F9',
    margin: collapsed ? '8px 4px' : '8px 6px',
  }),
  themeBtn: (collapsed) => ({
    marginTop: 'auto',
    alignSelf: collapsed ? 'center' : 'flex-start',
    marginLeft: collapsed ? 0 : 4,
    width: 34, height: 34,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, border: 'none', background: 'transparent',
    color: '#94A3B8', cursor: 'pointer',
    transition: 'background 150ms, color 150ms',
  }),
}

export default function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse, theme, onToggleTheme }) {
  return (
    <aside style={S.aside(collapsed)}>
      {/* Header */}
      <div style={S.header(collapsed)}>
        {!collapsed && <span style={S.sectionLabel}>Navigation</span>}
        <button
          style={S.toggleBtn}
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand' : 'Collapse'}
          onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Nav items */}
      {NAV.map(item => {
        const active = activePage === item.key
        return (
          <button
            key={item.key}
            style={S.navBtn(active, collapsed)}
            onClick={() => onNavigate(item.key)}
            title={collapsed ? item.label : undefined}
            aria-current={active ? 'page' : undefined}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#334155' } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' } }}
          >
            {active && <span style={S.activeBar} />}
            <item.icon size={17} strokeWidth={active ? 2.3 : 1.8} />
            {!collapsed && <span style={S.label}>{item.label}</span>}
            {item.badge && <span style={S.badgeDot(collapsed)} />}
          </button>
        )
      })}

      <div style={S.divider(collapsed)} />

      {BOTTOM.map(item => {
        const active = activePage === item.key
        return (
          <button
            key={item.key}
            style={S.navBtn(active, collapsed)}
            onClick={() => onNavigate(item.key)}
            title={collapsed ? item.label : undefined}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#334155' } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' } }}
          >
            {active && <span style={S.activeBar} />}
            <item.icon size={17} strokeWidth={active ? 2.3 : 1.8} />
            {!collapsed && <span style={S.label}>{item.label}</span>}
          </button>
        )
      })}

      {/* Theme toggle */}
      <button
        style={S.themeBtn(collapsed)}
        onClick={onToggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
      >
        {theme === 'dark' ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
      </button>
    </aside>
  )
}
