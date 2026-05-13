'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }

      // Try to fetch profile
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      // If no profile exists, create one
      if (error?.code === 'PGRST116') {
        const email = session.user.email || ''
        const name = session.user.user_metadata?.name || email.split('@')[0]
        const role = email === 'brightstacklabs@gmail.com' ? 'admin' : 'user'

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: session.user.id, email, name, role })
          .select()
          .single()

        if (insertError) {
          // Profile insert failed — check if it was partially created
          const { data: retry } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (retry) {
            setUser(retry)
            setLoading(false)
            return
          }
          router.push('/')
          return
        }

        if (newProfile?.role !== 'admin') {
          router.push('/')
          return
        }
        setUser(newProfile)
        setLoading(false)
        return
      }

      if (data?.role !== 'admin') {
        router.push('/')
        return
      }
      setUser(data)
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
            <p style={{ fontSize: '12px', color: 'var(--gold)' }}>{user?.email}</p>
          </div>
        </aside>

        <div style={{ flex: 1, overflow: 'auto', background: 'var(--cream)' }}>
          {children}
        </div>
      </div>
    </main>
  )
}