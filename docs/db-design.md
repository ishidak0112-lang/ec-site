# DB設計書

最終更新: 2026-04-13

## 概要

- DB: PostgreSQL（Supabase）
- ORM: Prisma

## ER図（テキスト表現）

```
users ─────────────── orders ──── order_items ──── products
  │                                                    │
  └── accounts                               categories ┘
  └── sessions
```

## テーブル定義

### users（ユーザー）

| カラム | 型 | 制約 | 説明 |
|-------|-----|------|------|
| id | String (cuid) | PK | ユーザーID |
| name | String? | | 表示名 |
| email | String | UNIQUE | メールアドレス |
| emailVerified | DateTime? | | メール認証日時 |
| password | String? | | ハッシュ化パスワード |
| role | Role | DEFAULT USER | 権限（USER/ADMIN） |
| createdAt | DateTime | DEFAULT now() | 作成日時 |
| updatedAt | DateTime | | 更新日時 |

### products（商品）

| カラム | 型 | 制約 | 説明 |
|-------|-----|------|------|
| id | String (cuid) | PK | 商品ID |
| name | String | | 商品名 |
| description | String? | | 商品説明 |
| price | Int | | 価格（円） |
| stock | Int | DEFAULT 0 | 在庫数 |
| imageUrl | String? | | 商品画像URL |
| categoryId | String? | FK → categories | カテゴリID |
| published | Boolean | DEFAULT false | 公開フラグ |
| createdAt | DateTime | | 作成日時 |
| updatedAt | DateTime | | 更新日時 |

### categories（カテゴリ）

| カラム | 型 | 制約 | 説明 |
|-------|-----|------|------|
| id | String (cuid) | PK | カテゴリID |
| name | String | UNIQUE | カテゴリ名 |
| slug | String | UNIQUE | URLスラッグ |
| createdAt | DateTime | | 作成日時 |

### orders（注文）

| カラム | 型 | 制約 | 説明 |
|-------|-----|------|------|
| id | String (cuid) | PK | 注文ID |
| userId | String | FK → users | ユーザーID |
| totalAmount | Int | | 合計金額（円） |
| status | OrderStatus | DEFAULT PENDING | 注文ステータス |
| stripePaymentId | String? | | Stripe決済ID |
| shippingName | String | | 配送先氏名 |
| shippingAddress | String | | 配送先住所 |
| shippingZip | String | | 郵便番号 |
| createdAt | DateTime | | 注文日時 |
| updatedAt | DateTime | | 更新日時 |

### order_items（注文明細）

| カラム | 型 | 制約 | 説明 |
|-------|-----|------|------|
| id | String (cuid) | PK | 明細ID |
| orderId | String | FK → orders | 注文ID |
| productId | String | FK → products | 商品ID |
| quantity | Int | | 数量 |
| unitPrice | Int | | 単価（注文時点の価格） |

## Enum定義

### Role
| 値 | 説明 |
|----|------|
| USER | 一般ユーザー（デフォルト） |
| ADMIN | 管理者 |

### OrderStatus
| 値 | 説明 |
|----|------|
| PENDING | 注文受付（決済前） |
| PAID | 決済完了 |
| SHIPPED | 発送済み |
| DELIVERED | 配達完了 |
| CANCELLED | キャンセル |

## 設計上の注意点

- `order_items.unitPrice` は注文時点の価格を保存（商品価格変更後も正確な履歴を保持するため）
- `products.published = false` は管理者のみ閲覧可能、一般公開しない
- パスワードは bcrypt でハッシュ化して保存（生パスワードは保存しない）
