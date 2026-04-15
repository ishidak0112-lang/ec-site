# 作業記録

プロジェクト内の主要な実装・運用メモ（時系列）。

---

## 2026-04-15

### 設計見直し・バックログ
- 設計レビューで出た課題を [`design-backlog.md`](./design-backlog.md) に一覧化（ドキュメント整合・インデックス・検索・カテゴリ管理・将来拡張など）。対応は着手しやすい順で消化する方針。
- `CLAUDE.md` のドキュメント同期表に `docs/design-backlog.md` を追加。

---

## 2026-04-14

### 決済・在庫（Webhook / Checkout）
- `orders.stripeCheckoutSessionId`（UNIQUE）を追加。Webhook で **在庫減算と注文作成を同一トランザクション**にし、**同一 Stripe Checkout Session の二重注文**を防止。
- `POST /api/checkout/session` で **公開商品の在庫を DB 照会**し、不足・非公開は 400。
- DB 反映は `npx prisma db push`（または migrate）が必要。
- 調査で、`DATABASE_URL` が Supabase pooler（6543）の場合に `db push` が進まないケースを確認。`DATABASE_URL="$DIRECT_URL" npx prisma db push --accept-data-loss` で反映できることを確認。
- Stripe Dashboard の webhook は署名不一致（HTTP 400）を確認。ローカル検証時は `stripe listen --forward-to localhost:3000/api/webhooks/stripe` の `whsec_...` を `.env.local` に設定して運用。

### ドキュメント・README
- `README.md` を日本語化。`CLAUDE.md` への参照を追記。

### 管理画面・権限
- **管理者の初期画面**: `/admin`（ダッシュボード）。
- **ログイン後の遷移**: `role === 'ADMIN'` の場合は `/login` 成功後に `/admin` へ（`src/app/login/page.tsx`）。
- **ストアと管理の分離**（`src/proxy.ts`）:
  - `ADMIN` がトップ・商品詳細・カート・チェックアウト・注文完了・マイページ・新規登録等にアクセスした場合は `/admin` へリダイレクト。
  - ログイン済み `ADMIN` が `/login` を開いた場合も `/admin` へ。
  - `/admin/*` は未ログインはログインへ、一般ユーザーはトップへ。
- **会員向け API**: `ADMIN` は `POST /api/checkout/session`、`GET /api/orders`、`PUT /api/user/profile` を **403**（管理 API を利用）。
- **ヘッダー**: 管理者は「管理ダッシュボード」とログアウト中心（マイページ・カート非表示）。

### 管理ダッシュボード・注文
- `/admin`: Prisma で商品数・総注文数・一般会員数・今月売上（キャンセル除く）を表示。管理メニューに商品・注文・ユーザーを明示。
- `GET /api/admin/orders`: 検索を **注文ID・配送先名・配送メール・会員メール** に拡張。
- 注文明細の行金額表示を `unitPrice` に修正（`src/app/admin/orders/page.tsx`）。
- 管理ナビ: 概要 / 商品 / 注文 / ユーザー（`src/app/admin/layout.tsx`）。

### ビルド
- `package.json` の `build` に `prisma generate && next build` を指定。

### ドキュメント同期
- `docs/screen-flow.md`、`docs/api-design.md`、`docs/feature-list.md` を上記の挙動に合わせて更新。

### Git
- リモート `main` へプッシュ（コミット例: `b48b94c` 付近 — 管理者ストア分離・管理強化）。

---

最終更新: 2026-04-15（設計バックログ design-backlog.md 追加）
