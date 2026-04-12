'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/mypage');
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-24">
      <h1 className="text-4xl tracking-tight mb-12 text-center">新規登録</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm mb-2">お名前</label>
          <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div>
          <label className="block text-sm mb-2">メールアドレス</label>
          <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div>
          <label className="block text-sm mb-2">パスワード</label>
          <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <button type="submit" className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors">
          登録する
        </button>
        <p className="text-sm text-center text-gray-600">
          すでにアカウントをお持ちの方は
          <Link href="/login" className="underline ml-1">ログイン</Link>
        </p>
      </form>
    </div>
  );
}
