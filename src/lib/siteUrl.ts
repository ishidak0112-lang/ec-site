import type { NextRequest } from 'next/server'

/**
 * Stripe の success_url / cancel_url 等に使うサイトの絶対 URL。
 * 開発時は `NEXTAUTH_URL` が :3000 のまま、実際の dev サーバーが :3001 だとリダイレクト先が死に、タブが読み込み続ける。
 * ブラウザからの API には `Origin` が付くため、開発時はそれを優先する。
 */
export function resolveSiteUrl(req: NextRequest): string {
  const origin = req.headers.get('origin')?.replace(/\/$/, '') ?? null
  const envUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? ''

  if (process.env.NODE_ENV === 'development') {
    if (origin) return origin
    if (envUrl) return envUrl
    const host = req.headers.get('host')
    if (host && (host.includes('localhost') || host.startsWith('127.'))) {
      return `http://${host}`
    }
    return envUrl || 'http://localhost:3000'
  }

  if (envUrl) return envUrl
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (origin) return origin
  const host = req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (host) return `${proto}://${host}`
  return 'http://localhost:3000'
}
