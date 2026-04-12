import Link from 'next/link';
import { Package, ShoppingBag, Users, BarChart3 } from 'lucide-react';

const stats = [
  { icon: Package, value: '248', label: '総商品数' },
  { icon: ShoppingBag, value: '1,247', label: '総注文数' },
  { icon: Users, value: '892', label: '登録ユーザー数' },
  { icon: BarChart3, value: '¥3.2M', label: '今月の売上' },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl tracking-tight mb-8">ダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-white p-6 border border-gray-200">
            <Icon className="w-8 h-8 text-gray-400 mb-4" />
            <p className="text-3xl mb-1">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link href="/admin/products" className="bg-white p-8 border border-gray-200 hover:border-black transition-colors">
          <Package className="w-12 h-12 mb-4" />
          <h2 className="text-2xl mb-2">商品管理</h2>
          <p className="text-gray-600">商品の登録、編集、削除、在庫管理</p>
        </Link>
        <Link href="/admin/orders" className="bg-white p-8 border border-gray-200 hover:border-black transition-colors">
          <ShoppingBag className="w-12 h-12 mb-4" />
          <h2 className="text-2xl mb-2">注文管理</h2>
          <p className="text-gray-600">注文一覧の確認、発送ステータスの更新</p>
        </Link>
      </div>
    </div>
  );
}
