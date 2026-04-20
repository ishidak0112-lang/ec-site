import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

/** 一般向けストア（管理者は利用不可 → /admin へ） */
function isStorefrontPath(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathname.startsWith('/products/')) return true
  if (
    ['/mypage', '/cart', '/checkout', '/order-complete', '/auth/signup'].includes(
      pathname
    )
  ) {
    return true
  }
  return false
}

export default auth(req => {
  const { pathname } = req.nextUrl
  const role = (req.auth?.user as { role?: string } | undefined)?.role

  if (pathname.startsWith('/admin')) {
    if (!req.auth) {
      return NextResponse.redirect(
        new URL('/login?callbackUrl=/admin', req.url)
      )
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  if (pathname === '/login' && req.auth && role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  if (req.auth && role === 'ADMIN' && isStorefrontPath(pathname)) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/',
    '/mypage',
    '/cart',
    '/checkout',
    '/order-complete',
    '/auth/signup',
    '/products/:path*',
  ],
}
