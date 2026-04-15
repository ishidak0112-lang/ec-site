'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface OrderInfo {
  orderId: string
  totalAmount: number
  shippingName: string
}

function OrderDetails() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!sessionId);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/checkout/verify?session_id=${sessionId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok && data?.error) {
          setVerifyError(typeof data.error === 'string' ? data.error : '注文情報の取得に失敗しました。');
          return;
        }
        if (data?.orderId != null) {
          setOrderInfo(data as OrderInfo);
        }
      })
      .catch(() => setVerifyError('注文情報の取得に失敗しました。ネットワークをご確認ください。'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return <p className="text-gray-600 mb-12">注文情報を確認中...</p>;
  }

  if (verifyError) {
    return (
      <div className="mb-12 space-y-3 text-left max-w-lg mx-auto">
        <p className="text-gray-800">{verifyError}</p>
        <p className="text-gray-600 text-sm">
          Stripe ではお支払いが完了している場合でも、反映まで数分かかることがあります。マイページの注文履歴をご確認ください。
        </p>
      </div>
    );
  }

  if (orderInfo) {
    return (
      <div className="mb-12 space-y-2">
        <p className="text-gray-600">注文が正常に完了しました。</p>
        <p className="text-gray-600">お名前: {orderInfo.shippingName} 様</p>
        <p className="text-gray-600">
          お支払い金額: ¥{orderInfo.totalAmount.toLocaleString()}
        </p>
        <p className="text-gray-500 text-sm mt-4">確認メールをお送りしましたのでご確認ください。</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <p className="text-gray-600">注文が正常に完了しました。</p>
      <p className="text-gray-600">確認メールをお送りしましたのでご確認ください。</p>
    </div>
  );
}

export default function OrderCompletePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
      <h1 className="text-4xl tracking-tight mb-4">ご注文ありがとうございます</h1>
      <Suspense fallback={<p className="text-gray-600 mb-12">読み込み中...</p>}>
        <OrderDetails />
      </Suspense>
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
