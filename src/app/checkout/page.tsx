'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartStore';
import Image from 'next/image';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    zipCode: '', city: '', address: '',
    paymentMethod: 'credit',
  });

  const subtotal = total();
  const shipping = subtotal >= 5000 ? 0 : 500;

  if (items.length === 0) {
    if (typeof window !== 'undefined') router.push('/cart');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    router.push('/order-complete');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl tracking-tight mb-12">購入手続き</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl mb-6">お客様情報</h2>
              <div className="space-y-4">
                {[
                  { label: 'お名前', name: 'name', type: 'text' },
                  { label: 'メールアドレス', name: 'email', type: 'email' },
                  { label: '電話番号', name: 'phone', type: 'tel' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-sm mb-2">{f.label} *</label>
                    <input type={f.type} name={f.name} required value={(formData as Record<string, string>)[f.name]} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl mb-6">配送先情報</h2>
              <div className="space-y-4">
                {[
                  { label: '郵便番号', name: 'zipCode', placeholder: '123-4567' },
                  { label: '都道府県・市区町村', name: 'city', placeholder: '東京都渋谷区' },
                  { label: '番地・建物名', name: 'address', placeholder: '神宮前1-2-3 〇〇マンション101' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-sm mb-2">{f.label} *</label>
                    <input type="text" name={f.name} required placeholder={f.placeholder} value={(formData as Record<string, string>)[f.name]} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl mb-6">お支払い方法</h2>
              {[
                { value: 'credit', label: 'クレジットカード' },
                { value: 'bank', label: '銀行振込' },
                { value: 'cod', label: '代金引換' },
              ].map(m => (
                <label key={m.value} className="flex items-center gap-3 p-4 border border-gray-300 cursor-pointer hover:bg-gray-50 mb-2">
                  <input type="radio" name="paymentMethod" value={m.value} checked={formData.paymentMethod === m.value} onChange={handleChange} className="w-4 h-4" />
                  <span>{m.label}</span>
                </label>
              ))}
              <p className="text-xs text-gray-500 mt-3">※ この画面はデモです。実際の決済は行われません。</p>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="text-xl mb-6">ご注文内容</h2>
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 flex-shrink-0">
                      <Image src={item.image} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-600">数量: {item.quantity}</p>
                      <p className="text-sm mt-1">¥{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between"><span className="text-gray-600">小計</span><span>¥{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">送料</span>
                  <span>{shipping === 0 ? <span className="text-green-600">無料</span> : `¥${shipping}`}</span>
                </div>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-lg">合計</span>
                <span className="text-2xl">¥{(subtotal + shipping).toLocaleString()}</span>
              </div>
              <button type="submit" className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors">
                注文を確定する
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
