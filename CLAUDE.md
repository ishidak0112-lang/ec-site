# ECサイト

## プロジェクト概要
学習・ポートフォリオ目的のBtoC型ECプラットフォーム。

## 技術スタック
- Framework: Next.js 14+ (App Router) + TypeScript
- Styling: Tailwind CSS
- ORM: Prisma
- DB: Supabase (PostgreSQL)
- Auth: NextAuth.js (Auth.js v5)
- Payment: Stripe
- Storage: Supabase Storage
- Deploy: Vercel

## ディレクトリ構成
```
src/
├── app/           # App Router pages & layouts
├── components/    # 再利用コンポーネント
├── lib/           # ユーティリティ・設定
└── types/         # 型定義
prisma/
└── schema.prisma  # DBスキーマ
docs/              # 設計ドキュメント
```

## 開発コマンド
- `npm run dev` — 開発サーバー起動
- `npx prisma studio` — DB GUI
- `npx prisma db push` — スキーマをDBに反映
- `npx prisma generate` — Prismaクライアント生成

## 環境変数（.env.local）
```
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Git運用
- 作業前: git pull
- 作業後: git add . && git commit -m "{変更内容}" && git push
