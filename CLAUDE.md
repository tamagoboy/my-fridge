# myFridge - プロジェクトルール

## プロジェクト概要
冷蔵庫管理 Web アプリ（Next.js App Router / TypeScript / PostgreSQL / Prisma）

## ドキュメント
- 要件定義: @docs/overview/要件定義書-v3.0.md
- 実装手順: @docs/overview/実装手順書-v2.0.md
- 命名規則: @docs/conventions/naming-conventions.md
- コマンド一覧: @docs/conventions/commands.md

## 命名規則（必須）
ファイル・メソッド・変数を作成する前に必ず `docs/conventions/naming-conventions.md` を参照すること。

### ファイル名の要約
- React コンポーネント → **PascalCase** (`FoodCard.tsx`)
- カスタムフック → **camelCase** (`useFoods.ts`)
- Zustand ストア → **camelCase** (`foodStore.ts`)
- lib / utils / 型定義 → **kebab-case** (`normalizer.ts`, `date-utils.ts`)
- ディレクトリ → **kebab-case**
- shadcn/ui → **kebab-case**（生成のまま）
- Next.js 規約ファイル → そのまま (`page.tsx`, `layout.tsx`, `route.ts`)

### コード内
- 変数・関数: `camelCase`
- コンポーネント・型: `PascalCase`
- 定数・Enum 値: `UPPER_SNAKE_CASE`
- Boolean: `is`/`has`/`can` プレフィックス
- イベントハンドラ: `handle` プレフィックス

## 技術スタック
- Next.js (App Router) / TypeScript
- PostgreSQL (Neon) / Prisma
- NextAuth.js (Auth.js) + Google OAuth
- Zustand + TanStack Query
- shadcn/ui + Tailwind CSS
- Vercel / Cloudflare R2

## コマンド
- `npm run dev` - 開発サーバー起動
- `npx prisma migrate dev` - マイグレーション実行
- `npx prisma studio` - DB GUI 起動
- `npx prisma db seed` - シードデータ投入
- `npm run test` - ユニットテスト実行（Vitest）
- `npm run test:ui` - Vitest UI 起動
- `npm run test:e2e` - E2E テスト実行（Playwright）

## テスト方針
| 種別 | ツール | 対象 | タイミング |
|---|---|---|---|
| ユニットテスト | Vitest | 正規化ロジック、API ハンドラ | 各 Step 実装後 |
| コンポーネントテスト | Vitest + Testing Library | 主要 UI コンポーネント | Step 3〜4 完了後 |
| E2E テスト | Playwright | OCR→保存フロー、認証フロー | Phase 1 完了後 |

- テストファイルは対象ファイルと同じ命名規則 + `.test` (`FoodCard.test.tsx`, `normalizer.test.ts`)

### テスト環境
- DOM 環境: **happy-dom**（Vitest の environment）
- API モック: **MSW v2**（`src/mocks/handlers.ts` にハンドラーを追加）
- セットアップ: `src/tests/setup.ts`（MSW サーバー起動 + jest-dom）

### テストルール（必須）
1. **機能を実装したら必ずテストを書く** — 新しいロジック・コンポーネントを追加するたびに `.test.ts(x)` を作成すること
2. **既存のテストを必ず実行する** — 実装後は `npm run test` を実行し、全テストがグリーンであることを確認してからコミットする
3. **テストの対象**
   - バックエンド: DB ロジック、API ハンドラー、ユーティリティ関数
   - フロントエンド: UI コンポーネント（レンダリング・イベント・状態変化）
4. **MSW で外部依存をモック** — fetch / NextAuth エンドポイントは `src/mocks/handlers.ts` にハンドラーを追加してモックする
5. **Prisma は `vi.mock('@/lib/prisma')` でモック** — テストから実 DB に接続しない

## Git ブランチ規則
- 機能: `feat/<チケット番号>` or `feat/step-N-概要`
- 修正: `fix/<チケット番号>` or `fix/概要`
- リファクタ: `refactor/概要`
- main ← develop ← feature ブランチの流れ

## コーディング方針
- 日本語コメントOK（ユーザーが日本語話者）
- エラーメッセージは日本語で返す
- API レスポンスの JSON キーは camelCase
- Prisma のフィールド名は camelCase
