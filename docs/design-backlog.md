# 設計・拡張バックログ

設計見直しで洗い出した課題。**対応しやすいものから順に消化**する。完了したら本表を更新し、関連する `docs/*.md` や `docs/feature-list.md` も同じコミットで同期すること。

最終更新: 2026-04-20（B-FEAT-05/06 商品画像複数対応・アップロード管理を追加）

---

## 運用ルール

- 着手する課題はステータスを `進行中` にし、完了したら `完了` にする。
- 実装やスキーマ変更が伴う場合は、プロジェクトの [ドキュメント同期ルール](../CLAUDE.md) に従う。

---

## 課題一覧

| ID | 課題 | 現状・根拠 | 想定対応 | 優先 | ステータス |
|----|------|------------|----------|------|------------|
| B-DOC-01 | **公開商品 API と実装の整合** | `api-design.md` に `GET /api/products`・`GET /api/products/[id]` があるが、ストア一覧は RSC + Prisma（`ProductGrid`）のみ。 | **A)** 設計書を「一覧は Server Component 直参照」と実装に合わせる **B)** または公開 Route Handler を追加しフロントを API 経由に統一する。方針を決めてドキュメントを一本化する。 | 高 | **完了**（2026-04-18・方針 A：`api-design.md` に RSC + Prisma を明記し、未実装の GET を一覧から削除） |
| B-DOC-02 | **`api-design.md` の `POST /api/orders` 例** | サンプルが残っており、実フロー（Stripe Checkout 中心）と誤解されうる。 | 現行フローに合わせて例を差し替え、または「非推奨・参考」の注記を付ける。 | 高 | 未着手 |
| B-DOC-03 | **`screen-flow.md` P-08 新規登録の実装フラグ** | P-08 が「未実装」のまま。`feature-list` では実装済み。 | `/auth/signup` の実装状況に合わせて表を修正する。 | 高 | **完了**（2026-04-15） |
| B-DB-01 | **商品一覧クエリ用インデックス** | `published`・`categoryId`・`createdAt` 等のフィルタに対し、設計書・スキーマにインデックス方針の記載がない。件数増加で効く。 | 想定クエリを `db-design.md` に書き、必要な `@@index` を Prisma に追加して `db-design.md` と同期。 | 中 | 未着手 |
| B-OPS-01 | **Prisma スキーマと DB の同期を手運用に頼らない** | `prisma/schema.prisma` は Git で更新されるが、**Supabase 等の DB は自動では変わらない**。`git pull` 後に `db push` / migrate を忘れると **P2022（カラム不存在）** が再発する。個人開発でも抜けやすい。 | **対応必須の方向性（いずれかを決めて実施）:** (1) **本番/Preview** は `prisma migrate deploy` をデプロイパイプラインに組み込む（Vercel Build Command や GitHub Actions）。(2) ローカル用に **post-merge / post-checkout フック**や README のチェックリストで「schema 差分があれば `db push`」を強制。(3) CI で `prisma migrate diff` 等による**ドリフト検知**（任意）。現状の手順は [`CLAUDE.md` の P2022 節](../CLAUDE.md) を参照。 | **高** | 未着手 |
| B-FEAT-01 | **キーワード検索** | `feature-list` Should・未着手。ワイヤーには検索 UI あり。 | 段階1: `ILIKE` または PostgreSQL 全文検索。段階2: 専用検索エンジンは別途判断。`api-design.md`・画面仕様を追加。 | 中 | 未着手 |
| B-FEAT-02 | **管理画面：カテゴリ CRUD** | `feature-list` Should・未着手。カテゴリ増加・slug 運用に必須。 | `/admin/categories` 等 + API。`category` 一意制約と URL 方針を `db-design.md` に追記。 | 中 | 未着手 |
| B-FEAT-03 | **管理画面：ユーザー詳細** | 顧客は `/admin/customers/[id]` で注文履歴まで対応済み。**従業員**向けは A-STAFF-01 で別途。 | — | 低 | **顧客分は完了**（2026-04-15） |
| B-FEAT-04 | **パスワードリセット** | Could・未着手。メール送信基盤が必要。 | メールプロバイダ決定後に設計。 | 低 | 未着手 |
| B-ARCH-01 | **大量商品時のページネーション** | 現状 OFFSET + `take`。超大量時は OFFSET コストが課題になりうる。 | 必要になったらカーソルベースを検討。`design-backlog` か `db-design.md` に判断メモ。 | 低（将来） | 未着手 |
| B-ARCH-02 | **商品モデルの拡張余地** | 1 商品 1 カテゴリ・画像 1 枚・在庫 1 列。 | 複数カテゴリ/タグ、階層カテゴリ、SKU・バリエーション、画像複数行は**要件が固まった段階**で `db-design.md` に案を書いてからスキーマ化。 | 低（将来） | 未着手 |
| B-FEAT-05 | **商品画像の複数対応** | 現状は `imageUrl` 1列（URL文字列）のみ。商品に複数画像を登録・並び替え・削除したい。 | スキーマに `ProductImage` テーブル（productId, url, order）を追加。管理画面で複数枚追加・並び替え・削除に対応。ストア側はギャラリー表示へ変更。`db-design.md`・`feature-list.md` を同期。 | 中 | 未着手 |
| B-FEAT-06 | **画像アップロード管理（URL入力廃止）** | 現状は画像URLを手入力する方式。画像ファイルを直接アップロードして管理できるようにしたい。 | ストレージ選定（Supabase Storage / Cloudflare R2 / Vercel Blob 等）→ アップロードAPI実装 → 管理画面に画像アップローダーUI追加 → B-FEAT-05と合わせて実装するのが効率的。方針決定後に `db-design.md`・`api-design.md` を更新。 | 中 | 未着手 |

---

## すぐ着手しやすい順（目安）

1. **B-OPS-01** — スキーマ変更のたびに障害が出るため、**デプロイ or CI での同期方針を早めに固定**すると以降が楽になる  
2. **B-DOC-02** — `POST /api/orders` 例を現行フローに合わせる（B-DOC-01・B-DOC-03 は完了）  
3. **B-DB-01** — 方針記述 → 必要ならインデックス追加  
4. **B-FEAT-02** — 運用でカテゴリを増やす前提なら優先度を上げる  
5. **B-FEAT-01** — UX とセットで検索パラメータ（`?q=`）を決める  

---

## 参照

- 機能の正式なステータス: [`feature-list.md`](./feature-list.md)
- 作業履歴: [`work-log.md`](./work-log.md)
