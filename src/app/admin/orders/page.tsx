'use client';

import { useState } from 'react';
import { mockOrders, statusLabel, statusColor } from '@/data/mockData';
import { Search, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import type { OrderStatus } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const filteredOrders = orders.filter(order =>
    order.id.toString().includes(searchTerm) ||
    order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus as OrderStatus } : order
    ));
  };

  return (
    <div>
      <h1 className="text-3xl tracking-tight mb-8">注文管理</h1>

      <div className="bg-white border border-gray-200 p-6 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="注文番号またはお名前で検索..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-gray-200"
          >
            <div
              className="p-6 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <p className="font-medium">注文番号: #{order.id}</p>
                    <span className={`px-3 py-1 text-xs ${statusColor[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>注文日: {new Date(order.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p>顧客名: {order.shippingAddress.name}</p>
                    <p>商品数: {order.items.length}点</p>
                  </div>
                </div>
                <div className="text-right mr-6">
                  <p className="text-2xl mb-1">¥{order.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">合計金額</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {expandedOrder === order.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium mb-4">注文商品</h3>
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span>{item.productName} × {item.quantity}</span>
                          <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-4">配送先情報</h3>
                    <div className="text-sm space-y-2 text-gray-700">
                      <p>氏名: {order.shippingAddress.name}</p>
                      <p>郵便番号: {order.shippingAddress.zipCode}</p>
                      <p>住所: {order.shippingAddress.address}</p>
                      <p>電話番号: {order.shippingAddress.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm mb-2">ステータスを更新</label>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="pending">注文確認中</option>
                    <option value="processing">処理中</option>
                    <option value="shipped">発送済み</option>
                    <option value="delivered">配送完了</option>
                    <option value="cancelled">キャンセル</option>
                  </select>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
