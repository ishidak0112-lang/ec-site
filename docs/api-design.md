# API設計書

最終更新: 2026-04-15（Checkout の success/cancel URL をリクエスト Origin で解決）

## 概要

Next.js App Router の Route Handlers（`src/app/api/`）で実装。

## 認証

- NextAuth.js のセッションCookieで認証
- 管理者APIは `role: ADMIN` を追加チェック
- **`role: ADMIN` のユーザー**は、会員向けの `GET /api/orders`・`POST /api/checkout/session`・`PUT /api/user/profile` を **403**（利用不可）。注文の参照・更新は `GET/PUT /api/admin/orders` を使用する。

## エンドポイント一覧

### 認証

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | /api/auth/signup | 新規会員登録 ✅ 実装済み | 不要 |
| POST | /api/auth/[...nextauth] | NextAuth.js ハンドラ ✅ 実装済み | - |

### ユーザー（マイページ）

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| PUT | /api/user/profile | プロフィール更新（名前） ✅ 実装済み | 必要（ADMIN は 403） |

### 商品

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | /api/products | 商品一覧（公開商品のみ） | 不要 |
| GET | /api/products/[id] | 商品詳細 | 不要 |

### 注文

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | /api/orders | 自分の注文一覧 ✅ 実装済み | 必要（ADMIN は 403） |
| GET | /api/orders/[id] | 注文詳細 | 必要（本人のみ） |
| POST | /api/orders/[id]/return | 返品申請（`returnStatus` を `REQUESTED` に更新）✅ 実装済み | 必要（本人のみ / ADMIN は 403） |

### 決済（Stripe）

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | /api/checkout/session | Stripe Checkout Session作成（**DB で在庫確認**、不足時 400）✅ | 必要（ADMIN は 403） |
| GET  | /api/checkout/verify | Stripe Session情報取得 ✅ 実装済み（`payment_status=paid` かつ注文未作成なら、Webhook未達時のフォールバックとして注文作成を試行） | 不要 |
| POST | /api/webhooks/stripe | `checkout.session.completed`：**同一トランザクションで在庫減算＋注文作成**、`stripeCheckoutSessionId` で冪等 ✅ | Stripe署名検証 |

**Webhook 挙動（`POST /api/webhooks/stripe`）**

- `checkout.session.completed` 時、`prisma.$transaction` 内で (1) 既に `stripeCheckoutSessionId` があればスキップ (2) 各明細について `stock >= quantity` を満たすよう `product` を減算 (3) `orders` / `order_items` を作成。
- 同一 `session.id` の再送・競合時は UNIQUE 制約（`P2002`）を握りつぶして 200 を返す（冪等）。
- 減算できない場合は 500（決済済みだが在庫不足 — 運用で返金等が必要になり得る）。
- ローカル開発等で Webhook が到達しない場合でも、`GET /api/checkout/verify` で同じ注文作成ロジックを呼び出し、売上未反映を回避する（冪等）。
- `GET /api/checkout/verify` のエラー例: Stripe のセッション取得失敗は **502**（`error` メッセージあり）。決済済みだが注文確定に失敗（在庫不足・メタデータ欠落など）は **500**。成功時は `orderId`（DB の注文ID）、`totalAmount`、`shippingName`。

### 管理者 API

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | /api/admin/products | 全商品一覧（非公開含む） ✅ 実装済み | ADMIN |
| POST | /api/admin/products | 商品登録 ✅ 実装済み | ADMIN |
| PUT | /api/admin/products/[id] | 商品更新 ✅ 実装済み | ADMIN |
| DELETE | /api/admin/products/[id] | 商品削除 ✅ 実装済み | ADMIN |
| GET | /api/admin/orders | 全注文一覧（`search`: 名前・メール・注文ID 等） ✅ 実装済み | ADMIN |
| PUT | /api/admin/orders/[id] | 注文更新 ✅（`status` に加え `packageCondition` / `accountingStatus` / `returnStatus` を個別指定可。いずれか1つ以上必須） | ADMIN |
| GET | /api/admin/users | ユーザー一覧 ✅ 実装済み | ADMIN |

### PUT /api/admin/orders/[id]（例）

```json
// Request — 開封状況のみ更新
{ "packageCondition": "UNOPENED" }

// Request — 返品フロー更新
{ "returnStatus": "REFUNDED" }
```

値は各 Prisma enum（`OrderStatus`, `OrderPackageCondition`, `OrderAccountingStatus`, `OrderReturnStatus`）に一致する必要がある。

### POST /api/orders/[id]/return（例）

```json
// Request（開封状態は任意）
{ "packageCondition": "UNOPENED" }
```

- 注文所有者のみ申請可能
- 注文ステータスが `PAID` / `SHIPPED` / `DELIVERED` の場合のみ受け付け
- 既に `returnStatus !== NONE` の注文は再申請不可

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

- `success_url` / `cancel_url` は `resolveSiteUrl(req)` で組み立てる。開発でポートが `3000` 以外（例: `3001`）のとき、`NEXTAUTH_URL` だけだと Stripe 決済後の戻り先が存在せずタブが読み込み続けるため、**リクエストの `Origin` を優先**する。本番は `NEXTAUTH_URL`（または Vercel の URL）を使用。

```json
// Response 200
{ "url": "https://checkout.stripe.com/..." }
```
