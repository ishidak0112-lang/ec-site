'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { mockProducts, categories } from '@/data/mockData';

export function ProductGrid() {
  const [selected, setSelected] = useState('すべて');
  const filtered = selected === 'すべて' ? mockProducts : mockProducts.filter(p => p.category === selected);

  return (
    <section id="products" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h2 className="text-4xl tracking-tight mb-8">商品一覧</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`px-4 py-2 whitespace-nowrap transition-colors text-sm ${
                selected === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/products/${product.id}`} className="group block">
              <div className="aspect-square overflow-hidden bg-gray-100 mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="mb-1 group-hover:opacity-60 transition-opacity">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.category}</p>
              <p className="font-medium">¥{product.price.toLocaleString()}</p>
              {product.stock < 10 && product.stock > 0 && (
                <p className="text-xs text-red-600 mt-1">残り{product.stock}点</p>
              )}
              {product.stock === 0 && (
                <p className="text-xs text-gray-500 mt-1">在庫なし</p>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
