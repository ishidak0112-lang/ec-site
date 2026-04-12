# API設計書

最終更新: 2026-04-13

## 概要

Next.js App Router の Route Handlers（`src/app/api/`）で実装。

## 認証

- NextAuth.js のセッションCookieで認証
- 管理者APIは `role: ADMIN` を追加チェック

## エンドポイント一覧

### 認証

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | /api/auth/signup | 新規会員登録 | 不要 |
| POST | /api/auth/[...nextauth] | NextAuth.js ハンドラ | - |

### 商品

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | /api/products | 商品一覧（公開商品のみ） | 不要 |
| GET | /api/products/[id] | 商品詳細 | 不要 |

### 注文

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | /api/orders | 注文作成 | 必要 |
| GET | /api/orders/[id] | 注文詳細 | 必要（本人のみ） |

### 決済（Stripe）

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | /api/checkout/session | Stripe Checkout Session作成 | 必要 |
| POST | /api/webhooks/stripe | Stripe Webhook受信 | Stripe署名検証 |

### 管理者 API

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | /api/admin/products | 全商品一覧（非公開含む） | ADMIN |
| POST | /api/admin/products | 商品登録 | ADMIN |
| PUT | /api/admin/products/[id] | 商品更新 | ADMIN |
| DELETE | /api/admin/products/[id] | 商品削除 | ADMIN |
| GET | /api/admin/orders | 全注文一覧 | ADMIN |
| PUT | /api/admin/orders/[id] | 注文ステータス更新 | ADMIN |
| GET | /api/admin/users | ユーザー一覧 | ADMIN |

## リクエスト/レスポンス例

### POST /api/orders
```json
// Request
{
  "items": [
    { "productId": "clxxx", "quantity": 2 }
  ],
  "shippingName": "山田 太郎",
  "shippingAddress": "東京都渋谷区xxx",
  "shippingZip": "150-0001"
}

// Response 200
{
  "orderId": "clyyy",
  "totalAmount": 5000
}
```

### POST /api/checkout/session
```json
// Request
{ "orderId": "clyyy" }

// Response 200
{ "url": "https://checkout.stripe.com/..." }
```
