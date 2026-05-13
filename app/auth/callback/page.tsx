'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSessionFromUrl()
      .then(({ data, error }) => {
        if (error || !data.session) {
          router.push('/')
        } else {
          router.push('/dashboard')
        }
      })
  }, [router])

  return (
    <main className="page-wrapper">
      <Nav />
      <div style={{ maxWidth: '440px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <p className="section-label">Signing you in...</p>
      </div>
    </main>
  )
}