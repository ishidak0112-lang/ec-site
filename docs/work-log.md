# 作業記録

プロジェクト内の主要な実装・運用メモ（時系列）。

---

## 2026-04-15

### 障害対応（開発環境・DB反映）
- `P2022: The column orders.packageCondition does not exist` を確認。原因はアプリ側スキーマ更新に対して DB 側カラム未反映だったこと。
- `.env.local` に `DIRECT_URL` は存在するが、シェル環境変数にロードされていないケースを確認。`echo "$DIRECT_URL"` で空になる事象を切り分け。
- `set -a; source .env.local; set +a` で環境変数を読み込んでから `DATABASE_URL="$DIRECT_URL" npx prisma db push --accept-data-loss` を実行する運用を整理。
- Turbopack キャッシュ破損（`.next/dev/cache/...sst` / `ENOENT`）発生時の復旧として、`rm -rf .next` → `npm run dev` の手順を再確認。
- `mypage` の render 中 `router.push` による warning（Cannot update a component while rendering）を、`useEffect` リダイレクトに変更して解消。

### 決済反映の補強（Webhook未達対策）
- 調査で、決済後に `/api/webhooks/stripe` の受信ログが出ず、売上（orders）が未作成のケースを確認。
- `src/lib/checkoutOrder.ts` に「Checkout Session から注文作成」の共通処理を切り出し、Webhookと`/api/checkout/verify`の両方から利用するよう変更。
- `GET /api/checkout/verify` で `payment_status=paid` かつ未作成時に注文作成を試行するフォールバックを追加（冪等）。
- 注文確定に失敗した場合は **500** で理由を返す（従来はログのみで 200 になり得た）。完了画面は `error` を表示。
- Stripe セッション取得失敗は **502**。`/order-complete` で API 失敗時に案内文を表示。
- `CheckoutPage` の `router.push('/cart')` を render 中実行から `useEffect` へ移し、購入直後の runtime warning を解消。

### 商品画像（Unsplash 404）
- ターミナルに `upstream image response failed ... 404` が出ていた原因は、シードの「ワイヤレス充電器」が参照していた Unsplash 写真が削除済みだったこと。
- `prisma/seed.ts` の `imageUrl` を HTTP 200 になる別写真に差し替え。既存 DB は `npx prisma db seed`（または該当商品の `imageUrl` 更新）で反映。

### 返品申請フロー（ユーザー→管理）
- `POST /api/orders/[id]/return` を追加。ユーザー本人のみ返品申請でき、`returnStatus` を `REQUESTED` に更新。
- マイページ注文履歴に「返品申請する」ボタンを追加。対象注文（`PAID` / `SHIPPED` / `DELIVERED` かつ未申請）のみ表示。
- 申請時に開封状態（任意）を送信可能。管理画面 `/admin/orders` の返品ステータス運用と連携。

### 返品・注文ステータス
- `orders` に `packageCondition`（開封）・`accountingStatus`（会計）・`returnStatus`（返品〜返金）を追加。返金額はアプリでは算定せず、法令順守を `/legal/returns` に記載。
- 管理画面 `/admin/orders` で各ステータスを更新可能。`PUT /api/admin/orders/[id]` が上記フィールドに対応。
- フッター・チェックアウト・マイページから返品案内へ誘導。
- DB 反映: `npx prisma db push`（または migrate）。

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

最終更新: 2026-04-15（verify エラー応答・シード画像URL・完了画面）
