# 命名規則ガイド

> myFridge プロジェクトにおけるファイル名・コード内の命名規則

---

## 1. ファイル名・ディレクトリ名

### 方針: 役割別に使い分け

| 対象 | 規則 | 例 |
|---|---|---|
| React コンポーネント | **PascalCase** | `FoodCard.tsx`, `ReceiptScanner.tsx` |
| ページ / レイアウト | **Next.js 規約に従う** | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| API Route | **Next.js 規約に従う** | `route.ts` |
| カスタムフック | **camelCase**（`use` プレフィックス） | `useFoods.ts`, `useAuth.ts` |
| Zustand ストア | **camelCase**（`Store` サフィックス） | `foodStore.ts`, `uiStore.ts` |
| ユーティリティ / lib | **kebab-case** | `normalizer.ts`, `prisma.ts`, `date-utils.ts` |
| 型定義ファイル | **kebab-case** | `food.ts`, `ocr-result.ts` |
| 設定ファイル | **kebab-case / 慣習に従う** | `next.config.js`, `tailwind.config.ts` |
| テストファイル | **対象ファイルと同じ規則** + `.test` | `FoodCard.test.tsx`, `normalizer.test.ts` |
| ディレクトリ | **kebab-case** | `components/`, `food-list/`, `ui/` |

### 判別ルール（迷ったとき）

```
ファイルが React コンポーネントを default export している？
  → Yes → PascalCase（FoodCard.tsx）
  → No  → ファイルが use で始まるカスタムフック？
           → Yes → camelCase（useFoods.ts）
           → No  → kebab-case（normalizer.ts）
```

---

## 2. コード内の命名

| 対象 | 規則 | 例 |
|---|---|---|
| 変数 | `camelCase` | `foodList`, `isExpired`, `expiryDate` |
| 関数 | `camelCase` | `getFoods()`, `normalizeProductName()` |
| React コンポーネント | `PascalCase` | `FoodCard`, `ReceiptScanner` |
| 型 / インターフェース | `PascalCase` | `Food`, `OcrResult`, `StorageLocation` |
| Enum | `PascalCase`（値は `UPPER_SNAKE_CASE`） | `StorageLocation.FRIDGE` |
| 定数 | `UPPER_SNAKE_CASE` | `MAX_UPLOAD_SIZE`, `DEFAULT_EXPIRY_DAYS` |
| Boolean 変数 | `camelCase`（`is`/`has`/`can` プレフィックス） | `isExpired`, `hasImage`, `canEdit` |
| イベントハンドラ | `camelCase`（`handle` プレフィックス） | `handleSubmit`, `handleDelete` |
| Props の型 | `PascalCase`（`Props` サフィックス） | `FoodCardProps`, `FoodFormProps` |

---

## 3. Prisma / DB 関連

| 対象 | 規則 | 例 |
|---|---|---|
| モデル名 | `PascalCase`（単数形） | `Food`, `User`, `NormalizationRule` |
| フィールド名 | `camelCase` | `expiryDate`, `storageLocation`, `createdAt` |
| テーブル名（自動生成） | Prisma デフォルト（モデル名と同じ） | `Food`, `User` |
| Enum 値 | `UPPER_SNAKE_CASE` | `FRIDGE`, `FREEZER`, `VEGETABLE_ROOM` |

---

## 4. API 関連

| 対象 | 規則 | 例 |
|---|---|---|
| URL パス | **kebab-case** | `/api/foods`, `/api/foods/[id]/consume` |
| リクエスト / レスポンスの JSON キー | `camelCase` | `{ "foodName": "...", "expiryDate": "..." }` |
| クエリパラメータ | `camelCase` | `?storageLocation=FRIDGE&sortBy=expiryDate` |

---

## 5. CSS / スタイリング

| 対象 | 規則 | 例 |
|---|---|---|
| Tailwind クラス | Tailwind 規約に従う | `text-red-500`, `bg-white` |
| CSS カスタムプロパティ | `kebab-case`（`--` プレフィックス） | `--color-primary`, `--spacing-lg` |

---

## 6. ディレクトリ構成例

```
src/
├── app/                          # Next.js App Router（規約に従う）
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── foods/route.ts
│   │   └── ocr/route.ts
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── dashboard/
│   │   ├── add/page.tsx
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── scan/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui（kebab-case、shadcn 規約）
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── FoodCard.tsx              # PascalCase
│   ├── FoodForm.tsx
│   ├── ReceiptScanner.tsx
│   └── Providers.tsx
├── hooks/
│   ├── useFoods.ts               # camelCase
│   └── useAuth.ts
├── stores/
│   ├── foodStore.ts              # camelCase
│   └── uiStore.ts
├── lib/
│   ├── auth.ts                   # kebab-case
│   ├── prisma.ts
│   ├── ocr.ts
│   └── normalizer.ts
└── types/
    ├── food.ts                   # kebab-case
    └── ocr-result.ts
```

> **注意**: `components/ui/` 配下は shadcn/ui が生成するため `kebab-case`（`button.tsx`, `card.tsx`）。自作コンポーネントは `PascalCase`。

---

## 7. Git ブランチ名

| 種類 | 規則 | 例 |
|---|---|---|
| 機能ブランチ | `feat/<チケット番号>` or `feat/step-N-概要` | `feat/KAN-4`, `feat/step-1-db-schema` |
| バグ修正 | `fix/<チケット番号>` or `fix/概要` | `fix/KAN-12`, `fix/expired-date-calc` |
| リファクタ | `refactor/概要` | `refactor/normalize-logic` |

---

## 変更履歴

- v1.0（2026-02-23）: 初版作成
