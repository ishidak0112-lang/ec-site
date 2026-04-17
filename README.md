# ECサイト

BtoC型ECプラットフォーム。商品閲覧・カート・Stripe決済・注文管理・管理画面を実装したフルスタックのECサイト。学習・ポートフォリオ目的のソロ開発プロジェクト。

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 15 (App Router) / TypeScript |
| スタイリング | Tailwind CSS / shadcn/ui / Base UI |
| ORM | Prisma 7（`@prisma/adapter-pg` 使用） |
| DB | PostgreSQL（Supabase） |
| 認証 | NextAuth.js (Auth.js v5) |
| 決済 | Stripe（Checkout + Webhook） |
| 画像ストレージ | Supabase Storage |
| デプロイ | Vercel + Supabase |

---

## 主な機能

### ユーザー向け
- 会員登録 / ログイン / プロフィール編集
- 商品一覧（ページネーション）・カテゴリ絞り込み・商品詳細
- カート追加・数量変更・削除
- 購入手続き・配送先入力・送料計算（5,000円以上で送料無料）
- Stripe Checkout による決済（クレジットカード / 銀行振込 / 代金引換）
- 注文履歴・注文詳細・返品申請
- 特商法対応の返品・解除案内ページ（`/legal/returns`）

### 管理者向け
- 商品登録・編集・削除・在庫管理
- 注文一覧・発送ステータス更新
- 顧客一覧・顧客詳細
- 返品申請の確認・承認

---

## クイックスタート

```bash
npm install

# DBスキーマ適用（Supabase に接続して実行）
npx prisma db push

# 開発サーバー起動
npm run dev
```

→ http://localhost:3000

---

## 環境変数

`.env.local` を作成して以下を設定する。

| 変数 | 用途 |
|------|------|
| `DATABASE_URL` | Supabase PostgreSQL の接続文字列 |
| `AUTH_SECRET` | NextAuth のシークレット（`openssl rand -base64 32` で生成） |
| `STRIPE_SECRET_KEY` | Stripe シークレットキー |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook シークレット |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公開キー |
| `NEXTAUTH_URL` | 本番URL（例: `https://your-domain.vercel.app`） |

---

## ディレクトリ構成

```
ec-site/
├── src/
│   └── app/
│       ├── page.tsx              # トップ（商品一覧）
│       ├── products/[id]/        # 商品詳細
│       ├── cart/                 # カート
│       ├── checkout/             # 購入手続き
│       ├── order-complete/       # 注文完了
│       ├── mypage/               # マイページ（注文履歴）
│       ├── auth/                 # 会員登録・ログイン
│       ├── legal/returns/        # 返品・解除案内
│       ├── admin/                # 管理画面（商品・注文・顧客）
│       └── api/                  # APIルート（auth / stripe webhook 等）
├── prisma/
│   └── schema.prisma             # DBスキーマ
├── docs/
│   ├── feature-list.md           # 機能一覧・実装ステータス
│   ├── db-design.md              # DB設計
│   ├── api-design.md             # API仕様
│   ├── screen-flow.md            # 画面遷移
│   └── work-log.md               # 作業履歴
└── CLAUDE.md                     # AI向け開発ルール
```

---

## npm スクリプト

| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |

---

## プロジェクト管理

課題・タスクは GitHub Issues で管理する。

---

## Prisma に関する注意

Prisma 7.7.0 以降、`datasource` の `url` フィールドが廃止された。本プロジェクトでは `@prisma/adapter-pg` を使用した接続方式に対応済み。詳細は `prisma.config.ts` を参照。
