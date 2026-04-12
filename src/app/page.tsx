import { ProductGrid } from '@/components/product/ProductGrid';

export default function HomePage() {
  return (
    <div>
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
            alt="Shop"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl md:text-7xl tracking-tight mb-6">
            YOUR STYLE,<br />OUR QUALITY
          </h1>
          <p className="text-lg mb-8 text-gray-300">厳選された高品質な商品をお届けします</p>
          <a href="#products" className="inline-block bg-white text-black px-8 py-3 hover:bg-gray-100 transition-colors">
            商品を見る
          </a>
        </div>
      </section>
      <ProductGrid />
    </div>
  );
}
