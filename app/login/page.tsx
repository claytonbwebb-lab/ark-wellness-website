'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { 
          data: { name, email },
          emailRedirectTo: 'https://www.ark-wellness.co.uk/auth/callback',
        } })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      setSuccess('Check your email to confirm your account, then sign in.')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }
      router.push('/dashboard')
      return
    }
    setLoading(false)
  }

  return (
    <main className="page-wrapper">
      <Nav />
      <div style={{ maxWidth: '440px', margin: '0 auto', padding: '100px 24px' }}>
        <p className="section-label">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, color: 'var(--deep-brown)', marginBottom: '8px' }}>
          {mode === 'login' ? 'Sign In' : 'Join The Ark'}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '36px' }}>
          {mode === 'login' ? 'Access your bookings and manage your sessions.' : 'Create an account to book and manage your sessions.'}
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          {mode === 'login' ? (
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>
              Don&apos;t have an account?{' '}
              <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '13px' }}>Sign up</button>
            </p>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '13px' }}>Sign in</button>
            </p>
          )}
        </div>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(196,150,90,0.2)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-mid)', lineHeight: 1.6 }}>
            Want to book as a guest?{' '}
            <button onClick={() => router.push('/book')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '12px' }}>Continue as guest →</button>
          </p>
        </div>
      </div>
    </main>
  )
}
