import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json()
    if (!email || !role) {
      return NextResponse.json({ error: 'Missing email or role' }, { status: 400 })
    }

    const sb = getServiceSupabase()

    // Find user by email
    const { data: userData, error: userError } = await sb
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error: updateError } = await sb
      .from('profiles')
      .update({ role })
      .eq('id', userData.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: `Role updated to ${role}` })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}