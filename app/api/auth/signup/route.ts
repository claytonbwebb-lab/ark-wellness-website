import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing email, password, or name' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const sb = getServiceSupabase()

    // Step 1: Create auth user with service role (bypasses RLS)
    const { data: authData, error: authError } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, email },
      app_metadata: { role: email === 'brightstacklabs@gmail.com' ? 'admin' : 'user' },
    })

    if (authError) {
      return NextResponse.json({ error: `Auth error: ${authError.message}` }, { status: 400 })
    }

    const userId = authData.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'No user ID returned' }, { status: 500 })
    }

    // Step 2: Create profile — try with explicit role, handle constraint errors
    const role = email === 'brightstacklabs@gmail.com' ? 'admin' : 'user'
    const { error: profileError } = await sb.from('profiles').insert({
      id: userId,
      email,
      name,
      role,
    })

    if (profileError) {
      // If profiles table doesn't exist yet, create it via SQL
      if (profileError.message.includes('does not exist') || profileError.code === '42P01') {
        // Try raw SQL via RPC to create table
        const { error: rpcError } = await sb.rpc('create_profiles_table', {}).catch(() => ({ error: null }))
        if (rpcError) {
          return NextResponse.json({ 
            error: 'Profiles table missing. Create it in Supabase SQL Editor.',
            userId,
            hint: 'Run: create table profiles (id uuid primary key references auth.users on delete cascade, email text unique not null, name text, role text default user)'
          }, { status: 500 })
        }
      }
      console.error('Profile creation error:', profileError.message)
    }

    return NextResponse.json({
      user: { id: userId, email, name },
      message: 'Account created. You can now sign in.'
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}