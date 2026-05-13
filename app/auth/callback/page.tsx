'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.session) {
          router.push('/dashboard')
        } else {
          router.push('/')
        }
      })
    } else {
      router.push('/')
    }
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