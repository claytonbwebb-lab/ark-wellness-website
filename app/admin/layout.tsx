'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'brightstacklabs@gmail.com'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }

      const email = session.user.email || ''
      const isAdmin = email === ADMIN_EMAIL
      setAdminEmail(email)

      if (!isAdmin) {
        router.push('/')
        return
      }

      // Ensure profile exists for this admin
      let { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!profile) {
        // Create profile if missing
        await supabase.from('profiles').insert({
          id: session.user.id,
          email,
          name: session.user.user_metadata?.name || email.split('@')[0],
          role: 'admin',
        })
      }

      setLoading(false)
    })
  }, [])

  if (loading) return (
    <main className="page-wrapper">
      <Nav />
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: 'var(--text-mid)' }}>Verifying admin access...</p>
      </div>
    </main>
  )

  const navItems = [
    { href: '/admin', label: 'Calendar', icon: '📅' },
    { href: '/admin/bookings', label: 'Bookings', icon: '📋' },
    { href: '/admin/availability', label: 'Availability', icon: '⏰' },
  ]

  return (
    <main className="page-wrapper">
      <Nav />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 68px)' }}>
        <aside style={{
          width: '220px', flexShrink: 0,
          background: 'var(--deep-brown)',
          borderRight: '1px solid rgba(196,150,90,0.1)',
          padding: '32px 0',
        }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(196,150,90,0.5)', padding: '0 24px', marginBottom: '20px' }}>Admin</p>
          <nav style={{ display: 'grid', gap: '4px' }}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 24px',
                  fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: pathname === item.href ? 'var(--gold)' : 'rgba(245,240,232,0.5)',
                  background: pathname === item.href ? 'rgba(196,150,90,0.08)' : 'transparent',
                  borderLeft: pathname === item.href ? '2px solid var(--gold)' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}>
                <span>{item.icon}</span> {item.label}
              </Link>
            ))}
          </nav>
          <div style={{ marginTop: '40px', padding: '0 24px', borderTop: '1px solid rgba(196,150,90,0.1)', paddingTop: '24px' }}>
            <p style={{ fontSize: '10px', color: 'rgba(245,240,232,0.3)', marginBottom: '8px' }}>Signed in as</p>
            <p style={{ fontSize: '12px', color: 'var(--gold)' }}>{adminEmail}</p>
          </div>
        </aside>

        <div style={{ flex: 1, overflow: 'auto', background: 'var(--cream)' }}>
          {children}
        </div>
      </div>
    </main>
  )
}