import { classifyOcrItems } from '@/lib/food-helpers'
import { parseReceiptText } from '@/lib/ocr'
import { prisma } from '@/lib/prisma'
import { requireSessionUser } from '@/lib/session'
import { extractReceiptTextFromImage } from '@/lib/vision'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser()
    const formData = await request.formData()
    const uploadedFile = formData.get('image')
    const debugText = formData.get('debugText')

    let receiptText = typeof debugText === 'string' ? debugText.trim() : ''

    if (!receiptText && uploadedFile instanceof File) {
      const buffer = Buffer.from(await uploadedFile.arrayBuffer())
      receiptText = (await extractReceiptTextFromImage(buffer)) ?? ''
    }

    if (!receiptText) {
      return NextResponse.json(
        {
          message: 'OCR結果を取得できませんでした。Vision API 設定、または確認用テキスト入力を確認してください。',
        },
        { status: 400 }
      )
    }

    const locations = await prisma.storageLocation.findMany({
      where: { fridgeId: user.fridgeId },
      select: {
        id: true,
        name: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    const normalizedItems = await parseReceiptText(receiptText)
    const items = await classifyOcrItems(normalizedItems, locations)

    return NextResponse.json({ items, sourceText: receiptText })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: 'OCR処理に失敗しました' }, { status: 500 })
  }
}
