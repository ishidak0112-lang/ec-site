'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/mypage');
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-24">
      <h1 className="text-4xl tracking-tight mb-12 text-center">ログイン</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
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
          ログイン
        </button>
        <p className="text-sm text-center text-gray-600">
          アカウントをお持ちでない方は
          <Link href="/auth/signup" className="underline ml-1">新規登録</Link>
        </p>
      </form>
    </div>
  );
}
