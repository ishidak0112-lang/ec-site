import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const categoryData = [
  { name: 'オーディオ', slug: 'audio' },
  { name: 'ウェアラブル', slug: 'wearable' },
  { name: 'バッグ', slug: 'bag' },
  { name: 'アクセサリー', slug: 'accessories' },
  { name: 'PC周辺機器', slug: 'pc-peripherals' },
  { name: '生活雑貨', slug: 'daily-goods' },
];

const productData = [
  {
    name: 'プレミアムワイヤレスヘッドフォン',
    description: '高音質でノイズキャンセリング機能を搭載した最新モデル。長時間の使用でも快適な装着感を実現。',
    price: 29800,
    stock: 45,
    categorySlug: 'audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  },
  {
    name: 'スマートウォッチ Pro',
    description: '健康管理とフィットネス追跡に最適。防水機能とGPS搭載で、あらゆるシーンで活躍。',
    price: 45000,
    stock: 32,
    categorySlug: 'wearable',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  },
  {
    name: 'ミニマルバックパック',
    description: 'シンプルで機能的なデザイン。PC収納可能で通勤・通学に最適なバックパック。',
    price: 12800,
    stock: 78,
    categorySlug: 'bag',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
  },
  {
    name: 'ポータブルスピーカー',
    description: '防水・防塵対応のアウトドアスピーカー。360度サウンドで臨場感あふれる音楽体験。',
    price: 8900,
    stock: 120,
    categorySlug: 'audio',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
  },
  {
    name: 'デザイナーズサングラス',
    description: 'UV400レンズ搭載。スタイリッシュなデザインで顔の形を選ばないユニバーサルフィット。',
    price: 15600,
    stock: 56,
    categorySlug: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
  },
  {
    name: 'エルゴノミックキーボード',
    description: '手首の負担を軽減する人間工学に基づいた設計。静音性に優れたメカニカルスイッチ採用。',
    price: 18900,
    stock: 41,
    categorySlug: 'pc-peripherals',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
  },
  {
    name: 'トラベルマグボトル',
    description: '真空断熱構造で保温・保冷効果が長時間持続。スリムデザインでバッグに収納しやすい。',
    price: 3980,
    stock: 200,
    categorySlug: 'daily-goods',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
  },
  {
    name: 'ワイヤレス充電器',
    description: 'Qi対応のワイヤレス充電パッド。複数デバイス同時充電可能で、デスク周りをすっきり整理。',
    price: 5600,
    stock: 95,
    categorySlug: 'pc-peripherals',
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
  },
];

async function main() {
  console.log('Seeding categories...');

  // upsert categories by slug (slug has @unique)
  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    categories[cat.slug] = result.id;
    console.log(`  カテゴリ: ${cat.name} (${result.id})`);
  }

  console.log('Seeding products...');
  for (const product of productData) {
    const { categorySlug, ...rest } = product;
    const categoryId = categories[categorySlug];

    // Check if product already exists by name to make it idempotent
    const existing = await prisma.product.findFirst({ where: { name: rest.name } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { ...rest, categoryId, published: true },
      });
      console.log(`  商品更新: ${existing.name} (${existing.id})`);
    } else {
      const created = await prisma.product.create({
        data: { ...rest, categoryId, published: true },
      });
      console.log(`  商品作成: ${created.name} (${created.id})`);
    }
  }

  console.log('Seed completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
