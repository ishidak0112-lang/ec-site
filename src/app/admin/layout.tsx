'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || (path !== '/admin' && pathname.startsWith(path));
  const navItems = [
    { href: '/admin', label: '概要' },
    { href: '/admin/products', label: '商品' },
    { href: '/admin/orders', label: '注文' },
    { href: '/admin/sales', label: '売上' },
    { href: '/admin/customers', label: '顧客' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-4 sm:gap-8 min-w-0">
              <Link href="/admin" className="text-lg sm:text-xl tracking-tight whitespace-nowrap">管理画面</Link>
              <nav className="hidden md:flex gap-6 text-sm">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={isActive(item.href) ? 'text-white' : 'text-gray-400 hover:text-white'}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <Link href="/" className="text-xs sm:text-sm text-gray-400 hover:text-white whitespace-nowrap">ストアに戻る</Link>
          </div>
          <nav className="md:hidden pb-3 -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded text-sm whitespace-nowrap ${
                    isActive(item.href) ? 'bg-white text-black' : 'bg-white/10 text-gray-200'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}
