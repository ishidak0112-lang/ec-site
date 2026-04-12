'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || (path !== '/admin' && pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-xl tracking-tight">管理画面</Link>
              <nav className="hidden md:flex gap-6 text-sm">
                <Link href="/admin/products" className={isActive('/admin/products') ? 'text-white' : 'text-gray-400 hover:text-white'}>商品管理</Link>
                <Link href="/admin/orders" className={isActive('/admin/orders') ? 'text-white' : 'text-gray-400 hover:text-white'}>注文管理</Link>
              </nav>
            </div>
            <Link href="/" className="text-sm text-gray-400 hover:text-white">ストアに戻る</Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}
