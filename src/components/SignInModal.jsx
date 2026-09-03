import React, { useState } from 'react'
import { Building2, Eye, EyeOff, Globe2, LockKeyhole, LogIn, Mail, ShieldCheck, X } from 'lucide-react'
import { login } from '../api/auth.js'

export default function SignInModal({ onClose, onSuccess, isBlocking = false }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await login(email, password)
      localStorage.setItem('nexaops_token', res.data.access_token)
      onSuccess(res.data.user)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Try admin@nexaops.com / nexaops123')
    } finally { setLoading(false) }
  }

  const inp = {
    width: '100%', height: 42, borderRadius: 8, border: '1px solid #E2E8F0',
    padding: '0 40px 0 40px', fontSize: 13, color: '#0F172A',
    outline: 'none', transition: 'border-color 150ms, box-shadow 150ms',
    fontFamily: 'inherit', background: '#fff',
  }

  return (
    <div
      onClick={e => !isBlocking && e.target === e.currentTarget && onClose && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: isBlocking ? 'rgba(10,16,35,0.88)' : 'rgba(10,16,35,0.72)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        role="dialog" aria-modal="true" aria-labelledby="sign-in-title"
        style={{
          position: 'relative', width: '100%', maxWidth: 440,
          background: '#fff', borderRadius: 20,
          boxShadow: '0 32px 80px rgba(10,22,64,0.40), 0 0 0 1px rgba(37,99,235,0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Top accent */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #3B82F6, #6366F1)', flexShrink: 0 }} />

        {/* Close button only if not blocking */}
        {!isBlocking && onClose && (
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
          >
            <X size={15} />
          </button>
        )}

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(37,99,235,0.25)' }}>
              <ShieldCheck size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
                Nexa<span style={{ color: '#2563EB' }}>Ops</span>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1 }}>Autonomous Operations Intelligence</div>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2563EB', marginBottom: 6 }}>Workspace access</div>
            <h2 id="sign-in-title" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#0F172A', margin: 0 }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 6, margin: '6px 0 0' }}>Sign in to monitor and resolve production issues.</p>
          </div>

          {error && (
            <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <label style={{ display: 'block' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Work Email</div>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" style={inp}
                  onFocus={e => { e.target.style.borderColor = '#93C5FD'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </label>

            {/* Password */}
            <label style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Password</span>
                <button type="button" style={{ fontSize: 12, color: '#2563EB', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</button>
              </div>
              <div style={{ position: 'relative' }}>
                <LockKeyhole size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ ...inp, paddingRight: 40 }}
                  onFocus={e => { e.target.style.borderColor = '#93C5FD'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            <button type="submit" disabled={loading}
              style={{ width: '100%', height: 42, borderRadius: 9, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#93C5FD' : '#2563EB', color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 2px 8px rgba(37,99,235,0.25)', transition: 'background 150ms' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1D4ED8' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563EB' }}
            >
              <LogIn size={15} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ position: 'relative', textAlign: 'center', margin: '20px 0' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', height: 1, background: '#F1F5F9' }} />
            </div>
            <span style={{ position: 'relative', background: '#fff', padding: '0 12px', fontSize: 11, color: '#94A3B8' }}>or continue with</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['Google SSO', Globe2, '#2563EB'], ['Microsoft SSO', Building2, '#475569']].map(([label, Icon, iconColor]) => (
              <button key={label} style={{ height: 38, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', color: '#475569', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'border-color 150ms, background 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#fff' }}
              >
                <Icon size={14} style={{ color: iconColor }} /> {label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 18 }}>
            Don't have an account?{' '}
            <a style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 500 }}>Request access</a>
          </p>
          <p style={{ fontSize: 10, color: '#CBD5E1', textAlign: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9', fontFamily: 'monospace' }}>
            Demo: admin@nexaops.com / nexaops123
          </p>
        </div>
      </div>
    </div>
  )
}
