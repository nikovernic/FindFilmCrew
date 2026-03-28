import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  
  if (!auth) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  const userRole = auth.user.user_metadata?.role || 'producer'

  return NextResponse.json({
    user: {
      id: auth.user.id,
      email: auth.user.email,
      name: auth.user.user_metadata?.name || null,
      role: userRole,
    },
  })
}

