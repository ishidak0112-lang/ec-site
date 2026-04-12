'use client';

import { useState } from 'react';
import { mockProducts } from '@/data/mockData';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('この商品を削除してもよろしいですか?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl tracking-tight">商品管理</h1>
        <button
          onClick={() => {
            setEditingProduct({ id: Date.now(), name: '', description: '', price: 0, stock: 0, category: '', image: '' });
            setShowModal(true);
          }}
          className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新規商品追加
        </button>
      </div>

      <div className="bg-white border border-gray-200 p-6 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="商品名で検索..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">商品</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">カテゴリ</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">価格</th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-600">在庫</th>
              <th className="px-6 py-3 text-right text-xs uppercase tracking-wider text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product, index) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{product.category}</td>
                <td className="px-6 py-4 text-sm">¥{product.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${product.stock < 10 ? 'text-red-600' : product.stock < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(product)} className="text-gray-600 hover:text-black mr-4">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-gray-600 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl mb-6">{editingProduct.name ? '商品編集' : '新規商品追加'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">商品名</label>
                <input type="text" defaultValue={editingProduct.name}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" required />
              </div>
              <div>
                <label className="block text-sm mb-2">説明</label>
                <textarea defaultValue={editingProduct.description} rows={4}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">価格</label>
                  <input type="number" defaultValue={editingProduct.price}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" required />
                </div>
                <div>
                  <label className="block text-sm mb-2">在庫数</label>
                  <input type="number" defaultValue={editingProduct.stock}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" required />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">カテゴリ</label>
                <input type="text" defaultValue={editingProduct.category}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" required />
              </div>
              <div>
                <label className="block text-sm mb-2">画像URL</label>
                <input type="url" defaultValue={editingProduct.image}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" required />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-black text-white py-2 hover:bg-gray-800 transition-colors">保存</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingProduct(null); }}
                  className="flex-1 border border-gray-300 py-2 hover:bg-gray-50 transition-colors">キャンセル</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
