import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderCompletePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
      <h1 className="text-4xl tracking-tight mb-4">ご注文ありがとうございます</h1>
      <p className="text-gray-600 mb-2">注文が正常に完了しました。</p>
      <p className="text-gray-600 mb-12">確認メールをお送りしましたのでご確認ください。</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/mypage" className="inline-block bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors">
          注文履歴を確認する
        </Link>
        <Link href="/" className="inline-block border border-black px-8 py-3 hover:bg-gray-50 transition-colors">
          買い物を続ける
        </Link>
      </div>
    </div>
  );
}
