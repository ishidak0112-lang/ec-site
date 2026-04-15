'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/lib/cartStore'
import { useSession, signOut } from 'next-auth/react'

export function Header() {
  const { itemCount } = useCart()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const count = itemCount()
  const isAdmin =
    !!session?.user &&
    (session.user as { role?: string }).role === 'ADMIN'
  const logoutCallbackUrl = '/login'

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl tracking-tight font-medium">
            EC STORE
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {!isAdmin && (
              <Link href="/" className="hover:opacity-60 transition-opacity">商品一覧</Link>
            )}
            {session ? (
              isAdmin ? (
                <Link href="/admin" className="hover:opacity-60 transition-opacity font-medium">
                  管理ダッシュボード
                </Link>
              ) : (
                <Link href="/mypage" className="hover:opacity-60 transition-opacity">マイページ</Link>
              )
            ) : null}
          </nav>

          <div className="flex items-center gap-4 text-sm">
            {!session && !isAdmin && (
              <Link href="/login" className="hidden md:block hover:opacity-60 transition-opacity text-gray-700">
                ログイン
              </Link>
            )}
            {session && !isAdmin && (
              <Link href="/mypage">
                <User className="w-5 h-5 text-gray-600" />
              </Link>
            )}
            {!isAdmin && (
              <Link href="/cart" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            )}
            <div className="hidden md:block">
              {session && isAdmin ? (
                <button
                  onClick={() => signOut({ callbackUrl: logoutCallbackUrl })}
                  className="hover:opacity-60 transition-opacity text-gray-600"
                >
                  ログアウト
                </button>
              ) : null}
            </div>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3 text-sm">
            {!isAdmin && (
              <Link href="/" className="block py-2" onClick={() => setMenuOpen(false)}>商品一覧</Link>
            )}
            {session ? (
              isAdmin ? (
                <>
                  <Link href="/admin" className="block py-2 font-medium" onClick={() => setMenuOpen(false)}>管理ダッシュボード</Link>
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ callbackUrl: logoutCallbackUrl }) }}
                    className="block py-2 text-left w-full text-gray-600"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link href="/mypage" className="block py-2" onClick={() => setMenuOpen(false)}>マイページ</Link>
                </>
              )
            ) : (
              <Link href="/login" className="block py-2" onClick={() => setMenuOpen(false)}>ログイン</Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
