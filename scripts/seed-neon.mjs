import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // categories
  const categories = [
    { id: 'cmnxxguui00005qqhgzfplmlp', name: 'オーディオ', slug: 'audio', createdAt: new Date('2026-04-13T16:13:21.451Z') },
    { id: 'cmnxxgvbz00015qqhhki9nvgw', name: 'ウェアラブル', slug: 'wearable', createdAt: new Date('2026-04-13T16:13:22.079Z') },
    { id: 'cmnxxgvej00025qqhw59tc059', name: 'バッグ', slug: 'bag', createdAt: new Date('2026-04-13T16:13:22.171Z') },
    { id: 'cmnxxgvgg00035qqhgfa19bep', name: 'アクセサリー', slug: 'accessories', createdAt: new Date('2026-04-13T16:13:22.240Z') },
    { id: 'cmnxxgvi500045qqhw6v6nipr', name: 'PC周辺機器', slug: 'pc-peripherals', createdAt: new Date('2026-04-13T16:13:22.301Z') },
    { id: 'cmnxxgvjo00055qqhkb5el4cc', name: '生活雑貨', slug: 'daily-goods', createdAt: new Date('2026-04-13T16:13:22.356Z') },
  ]
  for (const c of categories) {
    await prisma.category.upsert({ where: { id: c.id }, update: {}, create: c })
  }
  console.log(`categories: ${categories.length}件`)

  // products
  const products = [
    { id: 'cmnxxgw1b000a5qqhczmgl1zq', name: 'デザイナーズサングラス', description: 'UV400レンズ搭載。スタイリッシュなデザインで顔の形を選ばないユニバーサルフィット。', price: 15600, stock: 55, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', categoryId: 'cmnxxgvgg00035qqhgfa19bep', published: true, createdAt: new Date('2026-04-13T16:13:22.991Z'), updatedAt: new Date('2026-04-14T20:15:35.657Z') },
    { id: 'cmnxxgwcs000d5qqhaml5hs3a', name: 'ワイヤレス充電器', description: 'Qi対応のワイヤレス充電パッド。複数デバイス同時充電可能で、デスク周りをすっきり整理。', price: 5600, stock: 94, imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80', categoryId: 'cmnxxgvi500045qqhw6v6nipr', published: true, createdAt: new Date('2026-04-13T16:13:23.404Z'), updatedAt: new Date('2026-04-19T19:22:49.090Z') },
    { id: 'cmnxxgvn400065qqh73pf74m7', name: 'プレミアムワイヤレスヘッドフォン', description: '高音質でノイズキャンセリング機能を搭載した最新モデル。長時間の使用でも快適な装着感を実現。', price: 29800, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', categoryId: 'cmnxxguui00005qqhgzfplmlp', published: true, createdAt: new Date('2026-04-13T16:13:22.480Z'), updatedAt: new Date('2026-04-14T20:11:42.672Z') },
    { id: 'cmnxxgvqo00075qqh77xia0bo', name: 'スマートウォッチ Pro', description: '健康管理とフィットネス追跡に最適。防水機能とGPS搭載で、あらゆるシーンで活躍。', price: 45000, stock: 32, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', categoryId: 'cmnxxgvbz00015qqhhki9nvgw', published: true, createdAt: new Date('2026-04-13T16:13:22.608Z'), updatedAt: new Date('2026-04-14T20:11:42.782Z') },
    { id: 'cmnxxgvtp00085qqhiyw6ag6v', name: 'ミニマルバックパック', description: 'シンプルで機能的なデザイン。PC収納可能で通勤・通学に最適なバックパック。', price: 12800, stock: 78, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', categoryId: 'cmnxxgvej00025qqhw59tc059', published: true, createdAt: new Date('2026-04-13T16:13:22.717Z'), updatedAt: new Date('2026-04-14T20:11:42.881Z') },
    { id: 'cmnxxgvxk00095qqhxfibqyo4', name: 'ポータブルスピーカー', description: '防水・防塵対応のアウトドアスピーカー。360度サウンドで臨場感あふれる音楽体験。', price: 8900, stock: 120, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', categoryId: 'cmnxxguui00005qqhgzfplmlp', published: true, createdAt: new Date('2026-04-13T16:13:22.856Z'), updatedAt: new Date('2026-04-14T20:11:42.994Z') },
    { id: 'cmnxxgw4n000b5qqh91e3uvmd', name: 'エルゴノミックキーボード', description: '手首の負担を軽減する人間工学に基づいた設計。静音性に優れたメカニカルスイッチ採用。', price: 18900, stock: 41, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', categoryId: 'cmnxxgvi500045qqhw6v6nipr', published: true, createdAt: new Date('2026-04-13T16:13:23.111Z'), updatedAt: new Date('2026-04-14T20:11:43.227Z') },
    { id: 'cmnxxgw91000c5qqhwma9azuf', name: 'トラベルマグボトル', description: '真空断熱構造で保温・保冷効果が長時間持続。スリムデザインでバッグに収納しやすい。', price: 3980, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', categoryId: 'cmnxxgvjo00055qqhkb5el4cc', published: true, createdAt: new Date('2026-04-13T16:13:23.269Z'), updatedAt: new Date('2026-04-14T20:11:43.337Z') },
  ]
  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, update: {}, create: p })
  }
  console.log(`products: ${products.length}件`)

  console.log("シード完了")
}

main().catch(console.error).finally(() => prisma.$disconnect())
