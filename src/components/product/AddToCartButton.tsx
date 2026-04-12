'use client';

import { useCart } from '@/lib/cartStore';
import { useState } from 'react';
import type { Product } from '@/types';

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={product.stock === 0}
      className="w-full bg-black text-white py-4 hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      {product.stock === 0 ? '在庫なし' : added ? '✓ カートに追加しました' : 'カートに追加'}
    </button>
  );
}
