import dotenv from 'dotenv'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

/** 現在日時から指定日数後の Date を返す（負の値で過去） */
function daysFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(0, 0, 0, 0)
  return date
}

async function main() {
  console.log('🌱 シードデータの投入を開始します...')

  // ─────────────────────────────────────────────
  // User
  // ─────────────────────────────────────────────
  const user1 = await prisma.user.upsert({
    where: { id: 'test-user-1' },
    update: { name: 'テスト石渡', email: 'test-taro@example.com' },
    create: {
      id: 'test-user-1',
      googleId: 'google-test-001',
      name: 'テスト石渡',
      email: 'test-taro@example.com',
    },
  })
  console.log(`  User: ${user1.name} (${user1.id})`)

  const user2 = await prisma.user.upsert({
    where: { id: 'test-user-2' },
    update: { name: 'テスト智一', email: 'test-hanako@example.com' },
    create: {
      id: 'test-user-2',
      googleId: 'google-test-002',
      name: 'テスト智一',
      email: 'test-hanako@example.com',
    },
  })
  console.log(`  User: ${user2.name} (${user2.id})`)

  // ─────────────────────────────────────────────
  // Fridge
  // ─────────────────────────────────────────────
  const fridge1 = await prisma.fridge.upsert({
    where: { id: 'test-fridge-1' },
    update: { name: '石渡家の冷蔵庫' },
    create: { id: 'test-fridge-1', name: '石渡家の冷蔵庫' },
  })
  console.log(`  Fridge: ${fridge1.name} (${fridge1.id})`)

  const fridge2 = await prisma.fridge.upsert({
    where: { id: 'test-fridge-2' },
    update: { name: '智一の冷蔵庫' },
    create: { id: 'test-fridge-2', name: '智一の冷蔵庫' },
  })
  console.log(`  Fridge: ${fridge2.name} (${fridge2.id})`)

  // ─────────────────────────────────────────────
  // FridgeMember
  // ─────────────────────────────────────────────
  await prisma.fridgeMember.upsert({
    where: { userId: user1.id },
    update: { fridgeId: fridge1.id },
    create: { userId: user1.id, fridgeId: fridge1.id },
  })
  console.log(`  FridgeMember: ${user1.name} → ${fridge1.name}`)

  await prisma.fridgeMember.upsert({
    where: { userId: user2.id },
    update: { fridgeId: fridge2.id },
    create: { userId: user2.id, fridgeId: fridge2.id },
  })
  console.log(`  FridgeMember: ${user2.name} → ${fridge2.name}`)

  // ─────────────────────────────────────────────
  // FridgeInvitation
  // ─────────────────────────────────────────────
  await prisma.fridgeInvitation.upsert({
    where: { token: 'test-invite-token-001' },
    update: { expiresAt: daysFromNow(7) },
    create: {
      fridgeId: fridge1.id,
      token: 'test-invite-token-001',
      expiresAt: daysFromNow(7),
    },
  })
  console.log('  FridgeInvitation: test-invite-token-001')

  // ─────────────────────────────────────────────
  // Food（test-fridge-1 に紐づく）
  // ─────────────────────────────────────────────
  // 既存の Food を削除してから再作成（upsert だと食材名変更時にゴミが残るため）
  await prisma.food.deleteMany({ where: { fridgeId: fridge1.id } })

  const foods = [
    // 冷蔵室
    { name: '牛乳', category: '乳製品', quantity: 1, unit: '本', expiryDate: daysFromNow(0), storageLocation: '冷蔵室' },
    { name: '豚バラ肉', category: '肉', quantity: 300, unit: 'g', expiryDate: daysFromNow(-1), storageLocation: '冷蔵室' },
    { name: 'ヨーグルト', category: '乳製品', quantity: 2, unit: '個', expiryDate: daysFromNow(2), storageLocation: '冷蔵室' },
    { name: '納豆', category: 'その他', quantity: 3, unit: 'パック', expiryDate: daysFromNow(3), storageLocation: '冷蔵室' },
    { name: '卵', category: 'その他', quantity: 10, unit: '個', expiryDate: daysFromNow(10), storageLocation: '冷蔵室' },
    { name: '味噌', category: '調味料', quantity: 1, unit: '個', expiryDate: null, storageLocation: '冷蔵室' },
    // 冷凍室
    { name: '鶏もも肉', category: '肉', quantity: 500, unit: 'g', expiryDate: daysFromNow(30), storageLocation: '冷凍室' },
    { name: '冷凍うどん', category: 'その他', quantity: 3, unit: '袋', expiryDate: daysFromNow(60), storageLocation: '冷凍室' },
    // 野菜室
    { name: 'にんじん', category: '野菜', quantity: 3, unit: '本', expiryDate: daysFromNow(5), storageLocation: '野菜室' },
    { name: 'ほうれん草', category: '野菜', quantity: 1, unit: '袋', expiryDate: daysFromNow(1), storageLocation: '野菜室' },
    { name: 'トマト', category: '野菜', quantity: 4, unit: '個', expiryDate: daysFromNow(4), storageLocation: '野菜室' },
    // 常温
    { name: '米', category: 'その他', quantity: 5, unit: 'kg', expiryDate: null, storageLocation: '常温' },
    { name: '醤油', category: '調味料', quantity: 1, unit: '本', expiryDate: daysFromNow(90), storageLocation: '常温' },
    // 保管場所なし
    { name: 'バナナ', category: '野菜', quantity: 3, unit: '本', expiryDate: daysFromNow(2), storageLocation: null },
  ]

  await prisma.food.createMany({
    data: foods.map((food) => ({ ...food, fridgeId: fridge1.id })),
  })
  console.log(`  Food (${fridge1.name}): ${foods.length} 件作成`)

  // ─────────────────────────────────────────────
  // Food（test-fridge-2 に紐づく）
  // ─────────────────────────────────────────────
  await prisma.food.deleteMany({ where: { fridgeId: fridge2.id } })

  const foods2 = [
    // 冷蔵室
    { name: '豆腐', category: 'その他', quantity: 1, unit: 'パック', expiryDate: daysFromNow(1), storageLocation: '冷蔵室' },
    { name: 'チーズ', category: '乳製品', quantity: 1, unit: '袋', expiryDate: daysFromNow(14), storageLocation: '冷蔵室' },
    { name: 'ハム', category: '肉', quantity: 1, unit: 'パック', expiryDate: daysFromNow(-2), storageLocation: '冷蔵室' },
    // 冷凍室
    { name: '冷凍餃子', category: 'その他', quantity: 1, unit: '袋', expiryDate: daysFromNow(45), storageLocation: '冷凍室' },
    // 野菜室
    { name: 'キャベツ', category: '野菜', quantity: 1, unit: '個', expiryDate: daysFromNow(3), storageLocation: '野菜室' },
    { name: 'ピーマン', category: '野菜', quantity: 5, unit: '個', expiryDate: daysFromNow(6), storageLocation: '野菜室' },
    // 常温
    { name: 'パスタ', category: 'その他', quantity: 2, unit: '袋', expiryDate: null, storageLocation: '常温' },
  ]

  await prisma.food.createMany({
    data: foods2.map((food) => ({ ...food, fridgeId: fridge2.id })),
  })
  console.log(`  Food (${fridge2.name}): ${foods2.length} 件作成`)

  console.log('✅ シードデータの投入が完了しました')
}

main()
  .catch((e) => {
    console.error('❌ シードデータの投入に失敗しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
