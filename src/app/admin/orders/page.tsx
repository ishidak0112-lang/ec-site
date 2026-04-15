'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import {
  fulfillmentStatusColor,
  fulfillmentStatusLabel,
  packageConditionLabel,
  accountingStatusLabel,
  returnStatusLabel,
} from '@/lib/orderLabels';
import { genderLabel } from '@/lib/profileLabels';
import type { Gender } from '@prisma/client';

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string };
};

type Order = {
  id: string;
  status: string;
  packageCondition?: string;
  accountingStatus?: string;
  returnStatus?: string;
  totalAmount: number;
  shippingName: string;
  shippingZip: string;
  shippingPrefecture?: string;
  shippingCity?: string;
  shippingAddress: string;
  shippingPhone: string;
  createdAt: string;
  items: OrderItem[];
  user: {
    name: string | null;
    email: string | null;
    gender?: Gender;
    prefecture?: string | null;
  } | null;
};

function formatGender(g: Gender | undefined): string {
  if (!g) return '—';
  return genderLabel[g] ?? g;
}

function formatPrefecture(order: Order): string {
  const p = order.shippingPrefecture?.trim();
  if (p) return p;
  if (order.user?.prefecture) return order.user.prefecture;
  return '—';
}

async function fetchOrdersWithParams(params: URLSearchParams, setLoading: (v: boolean) => void, setError: (v: string | null) => void, setOrders: (v: Order[]) => void) {
  setLoading(true);
  setError(null);
  try {
    const qs = params.toString();
    const res = await fetch(qs ? `/api/admin/orders?${qs}` : '/api/admin/orders');
    if (!res.ok) throw new Error('注文の取得に失敗しました');
    const data = await res.json();
    setOrders(data);
  } catch (e) {
    setError(e instanceof Error ? e.message : '予期しないエラーが発生しました');
  } finally {
    setLoading(false);
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchOrdersWithParams(new URLSearchParams(), setLoading, setError, setOrders);
  }, []);

  const buildSearchParams = () => {
    const p = new URLSearchParams();
    if (searchTerm.trim()) p.set('search', searchTerm.trim());
    if (dateFrom) p.set('dateFrom', dateFrom);
    if (dateTo) p.set('dateTo', dateTo);
    return p;
  };

  const handleSearch = () => {
    void fetchOrdersWithParams(buildSearchParams(), setLoading, setError, setOrders);
  };

  const handleReset = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    void fetchOrdersWithParams(new URLSearchParams(), setLoading, setError, setOrders);
  };

  const patchOrder = async (orderId: string, payload: Record<string, string>) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('ステータスの更新に失敗しました');
      const updated: Order = await res.json();
      setOrders(prev =>
        prev.map(order => (order.id === orderId ? updated : order))
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : '更新に失敗しました');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl tracking-tight mb-6 sm:mb-8">注文管理</h1>

      <div className="bg-white border border-gray-200 p-3 sm:p-4 mb-4">
        <p className="text-xs text-gray-500 mb-2">注文日（日本時間・日付で範囲指定。空欄は条件なし）</p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-2 sm:gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">開始日</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="px-2 py-1.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <span className="text-gray-400 pb-1.5 hidden sm:inline">〜</span>
            <div>
              <label className="block text-xs text-gray-600 mb-1">終了日</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="px-2 py-1.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="注文ID・お名前・メールで検索..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full px-3 py-1.5 pl-9 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-1.5 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
              >
                検索
              </button>
              {(searchTerm || dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-1.5 border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
                >
                  リセット
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-12 text-gray-500">注文が見つかりません</div>
      )}

      <div className="space-y-1.5">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.02, 0.3) }}
            className="bg-white border border-gray-200 overflow-hidden"
          >
            <div
              className="py-2 px-3 sm:px-4 cursor-pointer hover:bg-gray-50"
              onClick={() =>
                setExpandedOrder(expandedOrder === order.id ? null : order.id)
              }
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-medium text-xs sm:text-sm break-all">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[11px] leading-tight ${
                        fulfillmentStatusColor[order.status] ?? 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {fulfillmentStatusLabel[order.status] ?? order.status}
                    </span>
                    {order.returnStatus && order.returnStatus !== 'NONE' && (
                      <span className="px-2 py-0.5 text-[11px] leading-tight bg-amber-100 text-amber-900">
                        返品: {returnStatusLabel[order.returnStatus] ?? order.returnStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5 leading-snug">
                    <span className="break-all">
                      {new Date(order.createdAt).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      <span className="text-gray-400 mx-1">·</span>
                      氏名: {order.shippingName}
                      <span className="text-gray-400 mx-1">·</span>
                      性別: {formatGender(order.user?.gender)}
                      <span className="text-gray-400 mx-1">·</span>
                      都道府県: {formatPrefecture(order)}
                      <span className="text-gray-400 mx-1">·</span>
                      {order.items.length}点
                    </span>
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0">
                  <div className="sm:text-right">
                    <p className="text-sm sm:text-base font-medium tabular-nums">
                      ¥{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${
                      expandedOrder === order.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {expandedOrder === order.id && (
              <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium mb-4">注文商品</h3>
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-4 text-sm"
                        >
                          <span className="min-w-0 break-words">
                            {item.product.name} × {item.quantity}
                          </span>
                          <span>
                            ¥{(item.unitPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-4">配送先情報</h3>
                    <div className="text-sm space-y-2 text-gray-700">
                      <p>氏名: {order.shippingName}</p>
                      <p>性別（アカウント）: {formatGender(order.user?.gender)}</p>
                      <p>郵便番号: {order.shippingZip}</p>
                      <p>都道府県（配送）: {formatPrefecture(order)}</p>
                      <p>
                        住所:{' '}
                        {order.shippingCity ? `${order.shippingCity} ` : ''}
                        {order.shippingAddress}
                      </p>
                      <p>電話番号: {order.shippingPhone}</p>
                    </div>
                    {order.user && (
                      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                        <p>アカウント: {order.user.name ?? '—'}</p>
                        <p>{order.user.email}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">注文フロー（発送・決済）</label>
                      <select
                        value={order.status}
                        onChange={e => patchOrder(order.id, { status: e.target.value })}
                        disabled={updatingId === order.id}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                      >
                        <option value="PENDING">注文確認中</option>
                        <option value="PROCESSING">処理中</option>
                        <option value="PAID">支払い済み</option>
                        <option value="SHIPPED">発送済み</option>
                        <option value="DELIVERED">配送完了</option>
                        <option value="CANCELLED">キャンセル</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">開封状況（返品判断の参考）</label>
                      <select
                        value={order.packageCondition ?? 'UNCONFIRMED'}
                        onChange={e =>
                          patchOrder(order.id, { packageCondition: e.target.value })
                        }
                        disabled={updatingId === order.id}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                      >
                        {Object.entries(packageConditionLabel).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">会計（売上計上）</label>
                      <select
                        value={order.accountingStatus ?? 'PENDING'}
                        onChange={e =>
                          patchOrder(order.id, { accountingStatus: e.target.value })
                        }
                        disabled={updatingId === order.id}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                      >
                        {Object.entries(accountingStatusLabel).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">返品・返金（法令に基づく処理）</label>
                      <select
                        value={order.returnStatus ?? 'NONE'}
                        onChange={e => patchOrder(order.id, { returnStatus: e.target.value })}
                        disabled={updatingId === order.id}
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                      >
                        {Object.entries(returnStatusLabel).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {updatingId === order.id && (
                    <p className="text-sm text-gray-500">更新中...</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
