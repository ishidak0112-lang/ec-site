'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cartStore';
import { Minus, Plus, X } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const subtotal = total();
  const shipping = subtotal >= 5000 ? 0 : subtotal === 0 ? 0 : 500;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-gray-500 mb-8">カートに商品がありません</p>
        <Link href="/" className="inline-block bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors">
          商品一覧を見る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl tracking-tight mb-12">カート</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-6">
              <div className="w-24 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                <Image src={item.image} alt={item.name} width={96} height={96} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm mb-2">{item.name}</h3>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-medium mb-4">¥{item.price.toLocaleString()}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6">
            <h2 className="text-xl mb-6">注文合計</h2>
            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between"><span className="text-gray-600">小計</span><span>¥{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-600">送料</span>
                <span>{shipping === 0 ? <span className="text-green-600">無料</span> : `¥${shipping}`}</span>
              </div>
            </div>
            <div className="flex justify-between mb-6">
              <span className="text-lg">合計</span>
              <span className="text-2xl font-medium">¥{(subtotal + shipping).toLocaleString()}</span>
            </div>
            <Link href="/checkout" className="block w-full bg-black text-white py-3 text-center hover:bg-gray-800 transition-colors">
              購入手続きへ
            </Link>
            <p className="text-xs text-gray-500 mt-3 text-center">5,000円以上で送料無料</p>
          </div>
        </div>
      </div>
    </div>
  );
}
