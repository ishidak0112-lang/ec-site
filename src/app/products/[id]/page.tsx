import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { mockProducts } from '@/data/mockData';
import { AddToCartButton } from '@/components/product/AddToCartButton';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = mockProducts.find(p => p.id === Number(id));
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-black mb-8 inline-block">
        ← 商品一覧に戻る
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <Image src={product.image} alt={product.name} width={600} height={600} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">{product.category}</p>
            <h1 className="text-3xl tracking-tight mb-4">{product.name}</h1>
            <p className="text-3xl font-medium">¥{product.price.toLocaleString()}</p>
          </div>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <div className="text-sm text-gray-500">
            在庫: {product.stock === 0 ? '在庫なし' : product.stock < 10 ? `残り${product.stock}点` : '在庫あり'}
          </div>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
