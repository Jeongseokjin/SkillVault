import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_ROUTES = ['/mypage', '/skills/upload']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/auth/login', '/auth/signup']

function matchesRoutes(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export async function middleware(request: NextRequest) {
  const { supabase, user, supabaseResponse } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isProtected = matchesRoutes(pathname, PROTECTED_ROUTES)
  const isAdmin = matchesRoutes(pathname, ADMIN_ROUTES)
  const isAuth = matchesRoutes(pathname, AUTH_ROUTES)

  if (!user && (isProtected || isAdmin)) {
    const loginUrl = new URL('/auth/login', request.url)
    if (isProtected) {
      loginUrl.searchParams.set('redirectTo', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  if (user && isAuth) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user && isAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_blocked')
      .eq('id', user.id)
      .single()

    if (profile?.is_blocked && pathname !== '/blocked') {
      return NextResponse.redirect(new URL('/blocked', request.url))
    }

    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (user && !isAdmin && !isAuth) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_blocked')
      .eq('id', user.id)
      .single()

    if (profile?.is_blocked && pathname !== '/blocked') {
      return NextResponse.redirect(new URL('/blocked', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
