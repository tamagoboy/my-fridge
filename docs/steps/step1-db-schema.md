# Step 1: DB スキーマ定義・マイグレーション

> 実装手順書 v2.0 の Step 1 詳細設計ドキュメント

---

## 概要

Prisma スキーマを定義し、PostgreSQL にマイグレーションを適用する。
後続の Step（認証・食材一覧・CRUD）が動作できる土台を整える。

---

## 作成ファイル一覧

| ファイル | 用途 |
|---|---|
| `prisma/schema.prisma` | DB スキーマ定義 |
| `src/lib/prisma.ts` | Prisma Client シングルトン |

---

## 1. prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// 認証テーブル（Google OAuth のみ対応）
// ─────────────────────────────────────────────

// - セッション管理は JWT 戦略（Cookie）→ Session テーブル不要
// - Google のみ対応 → Account テーブル不要、googleId を User に直接持つ
// - メール認証なし → VerificationToken テーブル不要
model User {
  id       String  @id @default(cuid())
  googleId String  @unique // Google の sub フィールド（ユーザー固有 ID）
  name     String?
  email    String  @unique
  image    String? // Google プロフィール画像 URL

  fridgeMember FridgeMember? // 所属する冷蔵庫（1 ユーザー 1 冷蔵庫）

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─────────────────────────────────────────────
// 冷蔵庫共有テーブル
// ─────────────────────────────────────────────

// 冷蔵庫グループ
// 初回ログイン時に自動作成される
model Fridge {
  id   String  @id @default(cuid())
  name String  @default("マイ冷蔵庫")

  members     FridgeMember[]
  foods       Food[]
  invitations FridgeInvitation[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 冷蔵庫メンバー（ユーザーと冷蔵庫の紐づけ）
// @@unique([userId]) で 1 ユーザー 1 冷蔵庫を保証
// 権限区分なし（全メンバー同等）
model FridgeMember {
  id       String @id @default(cuid())
  userId   String @unique
  fridgeId String

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  fridge Fridge @relation(fields: [fridgeId], references: [id], onDelete: Cascade)

  joinedAt DateTime @default(now())

  @@index([fridgeId])
}

// 招待リンク管理
// 冷蔵庫につき同時に有効なリンクは 1 つまで
// 再発行時は旧リンクを削除して新規作成
model FridgeInvitation {
  id       String   @id @default(cuid())
  fridgeId String
  token    String   @unique @default(uuid()) // 招待 URL に含めるトークン
  expiresAt DateTime // 有効期限（作成から 7 日間）

  fridge Fridge @relation(fields: [fridgeId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
}

// ─────────────────────────────────────────────
// アプリケーションテーブル
// ─────────────────────────────────────────────

// 食材テーブル
// 食材はユーザーではなく冷蔵庫に紐づく
model Food {
  id              String    @id @default(cuid())
  name            String    // 食材名
  category        String?   // カテゴリ名（野菜/肉/魚/惣菜/乳製品/調味料/その他）
  quantity        Float     // 数量
  unit            String    // 単位（個/本/袋/g/ml/パック 等、自由入力）
  expiryDate      DateTime? // 賞味期限（null = 期限なし）
  storageLocation String?   // 保管場所: '冷蔵室'|'冷凍室'|'野菜室'|'常温'
  fridgeId        String

  fridge Fridge @relation(fields: [fridgeId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([fridgeId])
  @@index([fridgeId, storageLocation])
  @@index([fridgeId, expiryDate])
}

// ─────────────────────────────────────────────
// 削除済みテーブル（Step 6 以降で必要に応じて追加）
// ─────────────────────────────────────────────
// - NormalizationRule: 正規化はバックエンドコードで実装（DB 辞書は使わない）
// - ProductMaster: 同上
// - CategoryStorageMapping: Phase 3 で必要になったら追加
// - Category: 同上
```

### 設計補足

| 項目 | 決定内容 | 理由 |
|---|---|---|
| セッション管理 | JWT 戦略（Cookie） | `Session` テーブル不要。強制ログアウト等の要件がないため |
| `Session` テーブル | **削除** | JWT 戦略で代替するため不要 |
| `Account` テーブル | **削除** | Google のみ対応。`googleId` を User に直接持つ方がシンプル |
| `VerificationToken` テーブル | **削除** | メール認証（マジックリンク）は使用しないため不要 |
| `Fridge` テーブル | 冷蔵庫グループ。初回ログイン時に自動作成 | 複数ユーザーで 1 つの冷蔵庫を共有するため |
| `FridgeMember` テーブル | `@@unique([userId])` で 1 ユーザー 1 冷蔵庫を保証 | 権限区分なし（全メンバー同等） |
| `FridgeInvitation` テーブル | 招待リンク管理。UUID トークン、7 日間有効 | 冷蔵庫につき同時 1 リンクまで |
| `Food.fridgeId` | 食材は冷蔵庫に紐づく | ユーザー単位ではなく冷蔵庫単位で管理 |
| `NormalizationRule` テーブル | **削除** | 正規化ロジックはバックエンドコードで実装。DB 辞書は使わない |
| `ProductMaster` テーブル | **削除** | 同上。OCR データはそのまま Food に保存 |
| `CategoryStorageMapping` テーブル | **削除** | Phase 3 で必要になったら追加 |
| `Category` テーブル | **削除** | 同上 |
| `storageLocation` の型 | `String?` | 将来の区分追加時にマイグレーション不要 |
| `Food.unit` | `String`（必須） | 単位なしは想定しない（最低でも「個」を入れる） |
| `Food.expiryDate` | `DateTime?`（任意） | 賞味期限のない食材（塩・砂糖等）に対応 |
| `Food.originalName` | **削除** | OCR データはそのまま保存する方針のため不要 |

---

## 2. src/lib/prisma.ts

```typescript
import { PrismaClient } from '@prisma/client'

// Next.js の HMR（ホットリロード）でインスタンスが増殖しないようにシングルトン化
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 3. prisma/seed.ts — データ設計

Step 1 ではシードデータなし。
`NormalizationRule` / `ProductMaster` / `Category` / `CategoryStorageMapping` テーブルを削除したため、投入するデータはない。

> 正規化ロジック（商品名のカタカナ統一・修飾語除去・英語変換）は Step 6 でバックエンドコードとして実装する。

---

## 4. 実行手順

```bash
# 1. Prisma 初期化（prisma/ ディレクトリ生成）
npx prisma init

# 2. schema.prisma を上記の内容で編集

# 3. マイグレーション作成・適用
npm run db:migrate
# プロンプトで migration 名を入力: init

# 4. 確認
npm run db:studio
```

> **Docker で開発している場合**:
> ```bash
> docker compose exec app sh
> # コンテナ内で上記コマンドを実行
> ```

---

## 5. 確認項目

| 確認内容 | 方法 |
|---|---|
| 全テーブルが作成されている（User / Fridge / FridgeMember / FridgeInvitation / Food） | `npm run db:studio` で確認 |
| `prisma generate` が成功する | `npm run db:generate` でエラーなし |

---

## 6. 設計上の注意点

### Account テーブルを持たない構成（Step 2 で実装）
`PrismaAdapter` を使わず、NextAuth のコールバックで `googleId` を使って User を直接 upsert する。
初回ログイン時は冷蔵庫（Fridge）を自動作成し、FridgeMember に登録する。

```typescript
// src/lib/auth.ts（Step 2 で実装）
export const authConfig = {
  session: { strategy: "jwt" },
  providers: [Google(...)],
  // adapter なし
  callbacks: {
    async signIn({ profile }) {
      const user = await prisma.user.upsert({
        where:  { googleId: profile.sub },
        update: { name: profile.name, image: profile.picture },
        create: { googleId: profile.sub, email: profile.email, name: profile.name, image: profile.picture },
      })

      // 冷蔵庫未所属なら自動作成
      const member = await prisma.fridgeMember.findUnique({ where: { userId: user.id } })
      if (!member) {
        await prisma.fridge.create({
          data: {
            members: { create: { userId: user.id } },
          },
        })
      }

      return true
    },
    async jwt({ token, profile }) {
      if (profile) {
        const user = await prisma.user.findUnique({ where: { googleId: profile.sub } })
        token.userId = user?.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.userId as string
      return session
    },
  },
}
```

### `Food.storageLocation` は null 許容
手動入力時にユーザーが保管場所を未設定のまま保存できるようにするため `String?` にする。
一覧画面では null の場合は「未設定」タブまたは「冷蔵室」として扱う（Step 3 で決定）。

### OCR データの保存方針
Phase 1 では OCR で読み取ったデータをそのまま Food テーブルに保存する。
商品名の正規化（カタカナ統一・修飾語除去・英語変換）は Step 6 でバックエンドコードとして実装する。

---

## 7. 未対応事項（後続 Step で対応）

| 項目 | 対応 Step |
|---|---|
| `src/lib/prisma.ts` に `log` オプション追加（開発時のクエリログ） | Step 2 実装時に必要なら追加 |
| `Food` テーブルへのテストデータ投入 | Step 3 で Prisma Studio から手動投入 |
| 正規化ロジック（バックエンドコード） | Step 6 で実装 |
| CategoryStorageMapping / Category テーブル追加 | Phase 3 で必要になったら追加 |
| 招待リンク発行・参加・離脱 API | Phase 1 後半で実装 |
| 招待関連 UI（設定画面の拡張、招待確認画面） | Phase 1 後半で実装 |
| 消費操作の楽観的ロック（`updatedAt` による競合検知） | Step 4（CRUD API）で実装 |
