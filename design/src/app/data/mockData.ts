export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    name: string;
    zipCode: string;
    address: string;
    phone: string;
  };
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'プレミアムワイヤレスヘッドフォン',
    description: '高音質でノイズキャンセリング機能を搭載した最新モデル。長時間の使用でも快適な装着感を実現。',
    price: 29800,
    stock: 45,
    category: 'オーディオ',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  },
  {
    id: 2,
    name: 'スマートウォッチ Pro',
    description: '健康管理とフィットネス追跡に最適。防水機能とGPS搭載で、あらゆるシーンで活躍。',
    price: 45000,
    stock: 32,
    category: 'ウェアラブル',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  },
  {
    id: 3,
    name: 'ミニマルバックパック',
    description: 'シンプルで機能的なデザイン。PC収納可能で通勤・通学に最適なバックパック。',
    price: 12800,
    stock: 78,
    category: 'バッグ',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
  },
  {
    id: 4,
    name: 'ポータブルスピーカー',
    description: '防水・防塵対応のアウトドアスピーカー。360度サウンドで臨場感あふれる音楽体験。',
    price: 8900,
    stock: 120,
    category: 'オーディオ',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
  },
  {
    id: 5,
    name: 'デザイナーズサングラス',
    description: 'UV400レンズ搭載。スタイリッシュなデザインで顔の形を選ばないユニバーサルフィット。',
    price: 15600,
    stock: 56,
    category: 'アクセサリー',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
  },
  {
    id: 6,
    name: 'エルゴノミックキーボード',
    description: '手首の負担を軽減する人間工学に基づいた設計。静音性に優れたメカニカルスイッチ採用。',
    price: 18900,
    stock: 41,
    category: 'PC周辺機器',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
  },
  {
    id: 7,
    name: 'トラベルマグボトル',
    description: '真空断熱構造で保温・保冷効果が長時間持続。スリムデザインでバッグに収納しやすい。',
    price: 3980,
    stock: 200,
    category: '生活雑貨',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
  },
  {
    id: 8,
    name: 'ワイヤレス充電器',
    description: 'Qi対応のワイヤレス充電パッド。複数デバイス同時充電可能で、デスク周りをすっきり整理。',
    price: 5600,
    stock: 95,
    category: 'PC周辺機器',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
  },
];

export const mockOrders: Order[] = [
  {
    id: 1001,
    userId: 1,
    totalAmount: 75400,
    status: 'delivered',
    createdAt: '2026-03-15T10:30:00',
    items: [
      { productId: 1, productName: 'プレミアムワイヤレスヘッドフォン', quantity: 1, price: 29800 },
      { productId: 2, productName: 'スマートウォッチ Pro', quantity: 1, price: 45000 },
    ],
    shippingAddress: {
      name: '山田太郎',
      zipCode: '150-0001',
      address: '東京都渋谷区神宮前1-2-3',
      phone: '03-1234-5678',
    },
  },
  {
    id: 1002,
    userId: 1,
    totalAmount: 12800,
    status: 'shipped',
    createdAt: '2026-04-01T14:20:00',
    items: [
      { productId: 3, productName: 'ミニマルバックパック', quantity: 1, price: 12800 },
    ],
    shippingAddress: {
      name: '山田太郎',
      zipCode: '150-0001',
      address: '東京都渋谷区神宮前1-2-3',
      phone: '03-1234-5678',
    },
  },
  {
    id: 1003,
    userId: 1,
    totalAmount: 24500,
    status: 'processing',
    createdAt: '2026-04-10T09:15:00',
    items: [
      { productId: 4, productName: 'ポータブルスピーカー', quantity: 1, price: 8900 },
      { productId: 5, productName: 'デザイナーズサングラス', quantity: 1, price: 15600 },
    ],
    shippingAddress: {
      name: '山田太郎',
      zipCode: '150-0001',
      address: '東京都渋谷区神宮前1-2-3',
      phone: '03-1234-5678',
    },
  },
];

export const categories = [
  'すべて',
  'オーディオ',
  'ウェアラブル',
  'バッグ',
  'アクセサリー',
  'PC周辺機器',
  '生活雑貨',
];
