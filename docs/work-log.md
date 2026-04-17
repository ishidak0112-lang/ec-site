# 作業記録

プロジェクト内の主要な実装・運用メモ（時系列）。

---

## 2026-04-18

### Vercel 本番が 404（`FUNCTION_RUNTIME_DEPRECATED`）
- 応答ヘッダ `x-vercel-error: FUNCTION_RUNTIME_DEPRECATED` — デプロイに紐づくサーバーレスランタイムがプラットフォームで非推奨扱いになっていた。
- `package.json` に **`engines.node`: `20.x`** を追加し、再デプロイで最新サポートランタイムを使うよう明示。
- Next.js 16 の **`proxy.ts`（Node 上の Proxy）** が同エラーを誘発しうるため、**Edge の `middleware.ts`** に戻してデプロイ（ビルドは「middleware 非推奨・proxy 推奨」の警告が出るが、本番応答優先）。

### B-DOC-01（公開商品 API と実装の整合）
- 方針 **A** を採用: ストアの商品一覧・詳細は **Server Component + Prisma**（`ProductGrid`、`products/[id]/page.tsx`）であり、公開用 `GET /api/products` は**存在しない**。
- `docs/api-design.md` に上記を「概要」直下で明記し、エンドポイント一覧から未実装の GET 行を削除。`design-backlog.md` の B-DOC-01 を完了に更新。

---

## 2026-04-15

### 管理画面：顧客と管理者の分離
- 会員（`role: USER`）のみを **`/admin/customers`** で一覧・検索。注文数表示・詳細へリンク。
- **`GET /api/admin/customers`** / **`GET /api/admin/customers/[id]`**（ADMIN アカウントは API でも一覧に出さない／詳細は 404）。
- **`/admin/users`** は **`/admin/customers` へリダイレクト**（旧ブックマーク互換）。ナビ表記は「顧客」。
- 従業員（ADMIN）専用の管理 UI は未作成（`feature-list` に A-STAFF-01 として未着手を明記）。

### ログアウト遅延の挙動確認
- `signOut` 時は `prepareLogoutClearCart()` で sessionStorage フラグ設定後、NextAuth の signout API でセッション Cookie を破棄し、`callbackUrl` にフルリロード遷移する。
- 体感が遅い主因はログアウト API そのものより「遷移先ページの再ロード + `/api/auth/session` 再確認」。dev（Turbopack）では本番より顕著。

### バックログ登録（Prisma／DB 同期）
- `docs/design-backlog.md` に **B-OPS-01**（スキーマと DB の同期を手運用に頼らない・デプロイ/CI 方針）を **高優先・未着手** で追加。

### P2022（`orders.shippingPrefecture` など）再発時の対応
- 原因はいつも同じ: **コード側スキーマ更新に対し、Supabase 側へ `prisma db push` が未実行**。
- 環境変数をシェルに載せたうえで `DATABASE_URL="$DIRECT_URL" npx prisma db push` を実行し同期済み。
- 繰り返しやすい理由は `CLAUDE.md` に「pull 後の db push」「P2022 の意味」を追記。

### プロフィール・注文の性別・都道府県
- `users` に `gender`（enum）・`prefecture`（任意）、`orders` に `shippingPrefecture`（配送先）を追加。
- チェックアウトで都道府県を 47 都道府県から選択。市区町村は別入力。
- マイページプロフィールで性別・都道府県を編集。`GET` / `PUT /api/user/profile` を拡張。
- 管理の注文一覧に「氏名（配送）・性別（アカウント）・都道府県（配送優先、なければプロフィール）」を表示。

### 管理画面・注文一覧
- `GET /api/admin/orders` に `dateFrom` / `dateTo`（`YYYY-MM-DD`、日本時間の 0:00〜23:59:59.999）を追加。テキスト検索と AND 合成。
- `/admin/orders` に開始日・終了日の `input[type=date]` を追加。一覧行のパディング・フォントを詰め、件数増加を想定したコンパクト表示。

### Stripe 決済後に EC に戻れない（タブが読み込み続ける）
- 原因: `success_url` が `NEXTAUTH_URL`（多くは `http://localhost:3000`）固定で、dev が `3001` など別ポートのとき、Stripe のリダイレクト先にサーバーがなく無限ローディングになる。
- 対応: `src/lib/siteUrl.ts` の `resolveSiteUrl(req)` を追加し、`POST /api/checkout/session` の `success_url` / `cancel_url` に使用。開発時はリクエストの **`Origin` を優先**。

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

### ログアウト時のカート
- カートは `localStorage` (`ec-cart`) に保持されていたため、ログアウト後も件数が残る状態だった。
- ログアウト直前に `prepareLogoutClearCart()` でフラグを立て、次画面の初回マウントで `ec-cart` を読み込まず削除。加えてセッションが認証済み→未認証に変わったときも空にする（SPA 内でのセッション切れ対策）。
- `signOut` 呼び出しは `Header`（管理者）と `mypage` でフラグ付与。

### チェックアウト 401（未ログイン）
- `POST /api/checkout/session` は会員セッション必須のため、未ログインだと **401**。購入手続き画面で未認証の場合は `/login?callbackUrl=/checkout` へ誘導し、API が 401 を返した場合も同様にリダイレクトする。

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

最終更新: 2026-04-15（ログアウト挙動の確認を追記）
