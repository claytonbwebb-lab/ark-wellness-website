'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token=')) {
      // Supabase hash-based auth: extract token from URL fragment
      const params = new URLSearchParams(hash.replace('#', ''))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        }).then(({ error }) => {
          if (!error) {
            router.push('/dashboard')
          } else {
            router.push('/')
          }
        })
      } else {
        router.push('/')
      }
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