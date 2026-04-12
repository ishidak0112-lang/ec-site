'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, User, LogOut } from 'lucide-react';
import { mockOrders, statusLabel, statusColor } from '@/data/mockData';

export default function MyPage() {
  const [tab, setTab] = useState<'orders' | 'profile'>('orders');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl tracking-tight mb-12">マイページ</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <nav className="space-y-2">
            {[
              { key: 'orders', label: '注文履歴', icon: Package },
              { key: 'profile', label: 'プロフィール', icon: User },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key as 'orders' | 'profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${tab === key ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <Icon className="w-5 h-5" />{label}
              </button>
            ))}
            <Link href="/login" className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 transition-colors">
              <LogOut className="w-5 h-5" />ログアウト
            </Link>
          </nav>
        </aside>

        <main className="lg:col-span-3">
          {tab === 'orders' && (
            <div>
              <h2 className="text-2xl mb-8">注文履歴</h2>
              <div className="space-y-6">
                {mockOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">注文日: {new Date(order.createdAt).toLocaleDateString('ja-JP')}</p>
                        <p className="text-sm text-gray-600">注文番号: #{order.id}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs ${statusColor[order.status]}`}>{statusLabel[order.status]}</span>
                    </div>
                    <div className="space-y-2 mb-6">
                      {order.items.map(item => (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span>{item.productName} × {item.quantity}</span>
                          <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                      <p className="text-sm text-gray-600">配送先: {order.shippingAddress.zipCode} {order.shippingAddress.city}{order.shippingAddress.address}</p>
                      <p className="text-lg">合計: ¥{order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div>
              <h2 className="text-2xl mb-8">プロフィール</h2>
              <div className="border border-gray-200 p-6">
                <div className="space-y-6">
                  {[
                    { label: 'お名前', type: 'text', value: '山田太郎' },
                    { label: 'メールアドレス', type: 'email', value: 'yamada@example.com' },
                    { label: '電話番号', type: 'tel', value: '03-1234-5678' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-sm mb-2">{f.label}</label>
                      <input type={f.type} defaultValue={f.value}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                  ))}
                  <button className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors">保存する</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
