import React, { useState } from 'react'
import { Building2, Eye, EyeOff, Globe2, LockKeyhole, LogIn, Mail, ShieldCheck } from 'lucide-react'
import { login } from '../api/auth.js'

export default function LoginPage({ onSuccess }) {
  const [email,    setEmail]    = useState('admin@nexaops.com')
  const [password, setPassword] = useState('nexaops123')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await login(email, password)
      localStorage.setItem('nexaops_token', res.data.access_token)
      localStorage.setItem('nexaops_user', JSON.stringify(res.data.user))
      onSuccess(res.data.user)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Try admin@nexaops.com / nexaops123')
    } finally { setLoading(false) }
  }

  const inp = {
    width: '100%', height: 44, borderRadius: 10, border: '1px solid #CBD5E1',
    padding: '0 40px 0 42px', fontSize: 14, color: '#0F172A',
    outline: 'none', transition: 'border-color 150ms, box-shadow 150ms',
    fontFamily: 'inherit', background: '#F8FAFC',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #0F172A, #020617)',
      padding: 20,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 460,
        background: '#ffffff',
        borderRadius: 24,
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
      }}>
        {/* Accent Bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #2563EB, #7C3AED)' }} />

        <div style={{ padding: '36px 36px 40px' }}>
          {/* Logo & Platform Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 6px 16px rgba(37,99,235,0.35)',
            }}>
              <ShieldCheck size={24} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.03em' }}>
                Nexa<span style={{ color: '#2563EB' }}>Ops</span>
                <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>PROD</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Autonomous Operations & Incident Resolution</div>
            </div>
          </div>

          <div style={{ marginBottom: 26 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: '#0F172A', margin: 0 }}>
              Sign In to your Workspace
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '6px 0 0' }}>
              Monitor pipelines, manage incidents, and approve AI fixes.
            </p>
          </div>

          {error && (
            <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, padding: '10px 14px', borderRadius: 10, marginBottom: 18 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email Field */}
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Work Email</span>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={inp}
                  onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)' }}
                  onBlur={e => { e.target.style.background = '#F8FAFC'; e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </label>

            {/* Password Field */}
            <label style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Password</span>
                <span style={{ fontSize: 11, color: '#2563EB', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
              </div>
              <div style={{ position: 'relative' }}>
                <LockKeyhole size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inp}
                  onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)' }}
                  onBlur={e => { e.target.style.background = '#F8FAFC'; e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 46, borderRadius: 12, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#93C5FD' : '#2563EB',
                color: '#fff', fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                transition: 'all 150ms ease',
                marginTop: 6,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1D4ED8' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563EB' }}
            >
              <LogIn size={16} />
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ position: 'relative', textAlign: 'center', margin: '22px 0' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', height: 1, background: '#E2E8F0' }} />
            </div>
            <span style={{ position: 'relative', background: '#fff', padding: '0 12px', fontSize: 11, color: '#94A3B8' }}>or continue with</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Google SSO', Globe2, '#2563EB'], ['Microsoft SSO', Building2, '#475569']].map(([label, Icon, iconColor]) => (
              <button
                key={label}
                type="button"
                style={{ height: 40, borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', color: '#334155', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'border-color 150ms, background 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#fff' }}
              >
                <Icon size={15} style={{ color: iconColor }} /> {label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace', background: '#F1F5F9', padding: '4px 8px', borderRadius: 6 }}>
              Demo: admin@nexaops.com / nexaops123
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
