# DB設計書

最終更新: 2026-04-15（ユーザー性別・都道府県・注文の配送先都道府県）

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
| gender | Gender | DEFAULT UNKNOWN | 性別（プロフィール・管理一覧表示） |
| prefecture | String? | | プロフィールの都道府県（任意） |
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
| totalAmount | Int | | 合計金額（円、送料込み） |
| status | OrderStatus | DEFAULT PENDING | 注文ステータス（発送・決済フロー） |
| packageCondition | OrderPackageCondition | DEFAULT UNCONFIRMED | 開封前／開封済など（返品・クーリングオフ判断の参考） |
| accountingStatus | OrderAccountingStatus | DEFAULT PENDING | 会計・売上計上の内部管理 |
| returnStatus | OrderReturnStatus | DEFAULT NONE | 返品・返金フロー（返金額は法令に従い別途処理） |
| stripePaymentId | String? | | Stripe PaymentIntent 等の決済ID（クレジット決済時） |
| stripeCheckoutSessionId | String? | UNIQUE | Stripe Checkout Session ID（Webhook 冪等・重複注文防止） |
| paymentMethod | String | DEFAULT 'credit' | 支払い方法（credit/bank/cod） |
| shippingName | String | | 配送先氏名 |
| shippingEmail | String | | 配送先メールアドレス |
| shippingPhone | String | | 配送先電話番号 |
| shippingZip | String | | 郵便番号 |
| shippingPrefecture | String | DEFAULT '' | 配送先都道府県（チェックアウトで選択） |
| shippingCity | String | | 市区町村 |
| shippingAddress | String | | 番地・建物名 |
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

### Gender
| 値 | 説明 |
|----|------|
| UNKNOWN | 未設定（デフォルト） |
| MALE | 男性 |
| FEMALE | 女性 |
| OTHER | その他 |

### OrderStatus
| 値 | 説明 |
|----|------|
| PENDING | 注文受付（決済前） |
| PROCESSING | 処理中（入金確認等） |
| PAID | 決済完了 |
| SHIPPED | 発送済み |
| DELIVERED | 配達完了 |
| CANCELLED | キャンセル |

### OrderPackageCondition
| 値 | 説明 |
|----|------|
| UNCONFIRMED | 未確認 |
| UNOPENED | 開封前 |
| OPENED | 開封済 |

### OrderAccountingStatus
| 値 | 説明 |
|----|------|
| PENDING | 未会計（売上未計上など） |
| SETTLED | 会計済 |

### OrderReturnStatus
| 値 | 説明 |
|----|------|
| NONE | 返品なし |
| REQUESTED | 返品申請中 |
| APPROVED | 返品承認 |
| REJECTED | 返品不可 |
| REFUNDED | 返金完了（実際の返金額・手続きは法令・決済事業者に従う） |

## 設計上の注意点

- **返品・返金額**: アプリは金額を自動計算しない。`OrderReturnStatus` は進捗管理用。返金額・可否は特定商取引法等に従い、画面 `/legal/returns` でユーザーに案内する。
- **在庫**: 決済完了 Webhook 内で `prisma.$transaction` により `products.stock` を減算してから `orders` を作成する。`stripeCheckoutSessionId` の UNIQUE で同一セッションの二重登録を防止する。
- `order_items.unitPrice` は注文時点の価格を保存（商品価格変更後も正確な履歴を保持するため）
- `products.published = false` は管理者のみ閲覧可能、一般公開しない
- パスワードは bcrypt でハッシュ化して保存（生パスワードは保存しない）
- `paymentMethod` は 'credit'（クレジットカード）/ 'bank'（銀行振込）/ 'cod'（代金引換）の3種類
- 銀行振込・代金引換の場合は `stripePaymentId` は NULL
- 住所は `shippingCity`（都道府県・市区町村）と `shippingAddress`（番地・建物名）に分割して保存
