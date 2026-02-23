# コマンドリファレンス

> プロジェクトで使用するコマンド一覧。`package.json` の `scripts` に追加する内容も含む。

---

## package.json scripts（設定値）

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate",
    "db:reset": "prisma migrate reset"
  }
}
```

---

## 用途別コマンド一覧

### 開発

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動（http://localhost:3000） |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run typecheck` | TypeScript 型チェック（ビルドなし） |

### コード品質

| コマンド | 内容 |
|---|---|
| `npm run lint` | ESLint でコードチェック |
| `npm run lint:fix` | ESLint 自動修正 |
| `npm run format` | Prettier でフォーマット |
| `npm run format:check` | Prettier チェックのみ（修正しない） |

### テスト

| コマンド | 内容 |
|---|---|
| `npm run test` | ユニット・コンポーネントテスト（Vitest、CI用） |
| `npm run test:watch` | ファイル変更を監視して自動実行 |
| `npm run test:ui` | Vitest UI をブラウザで起動 |
| `npm run test:coverage` | カバレッジレポート生成 |
| `npm run test:e2e` | E2E テスト（Playwright） |
| `npm run test:e2e:ui` | Playwright UI モードで起動 |

### DB（Prisma）

| コマンド | 内容 |
|---|---|
| `npm run db:generate` | Prisma Client 再生成（schema 変更後に実行） |
| `npm run db:migrate` | マイグレーション作成・適用（開発用） |
| `npm run db:migrate:prod` | マイグレーション適用のみ（本番用） |
| `npm run db:seed` | シードデータ投入 |
| `npm run db:studio` | Prisma Studio 起動（GUI でDB閲覧・編集） |
| `npm run db:reset` | DB リセット＋マイグレーション再適用（開発用） |

---

## よく使う npx コマンド

| コマンド | 内容 |
|---|---|
| `npx shadcn@latest add <component>` | shadcn/ui コンポーネント追加 |
| `npx prisma init` | Prisma 初期化（初回のみ） |
| `npx playwright install` | Playwright ブラウザのインストール |

---

## 開発フロー中のコマンド順

### 通常の開発
```bash
npm run dev          # サーバー起動
npm run typecheck    # 型チェック
npm run lint         # Lint チェック
npm run test         # テスト実行
```

### DB スキーマ変更後
```bash
npm run db:migrate   # マイグレーション作成・適用
npm run db:generate  # Prisma Client 再生成
npm run db:studio    # 内容確認
```

### コミット前
```bash
npm run typecheck
npm run lint
npm run test
```
