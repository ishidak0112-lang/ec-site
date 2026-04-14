import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl

  // /admin/* へのアクセス
  if (pathname.startsWith('/admin')) {
    // 未ログイン → /login にリダイレクト
    if (!req.auth) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/admin', req.url))
    }
    // ログイン済みだが ADMIN ロールでない → / にリダイレクト
    if ((req.auth.user as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
