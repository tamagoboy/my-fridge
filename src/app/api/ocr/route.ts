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
      try {
        const buffer = Buffer.from(await uploadedFile.arrayBuffer())
        receiptText = (await extractReceiptTextFromImage(buffer)) ?? ''
      } catch (visionError) {
        console.error('[OCR] Vision API error:', visionError)
        throw new Error(`Vision API エラー: ${visionError instanceof Error ? visionError.message : 'Unknown'}`)
      }
    }

    if (!receiptText) {
      console.error('[OCR] No receipt text extracted')
      return NextResponse.json(
        {
          message: 'OCR結果を取得できませんでした。Vision API 設定、または確認用テキスト入力を確認してください。',
        },
        { status: 400 }
      )
    }

    console.log('[OCR] Receipt text extracted:', receiptText.substring(0, 100))

    const locations = await prisma.storageLocation.findMany({
      where: { fridgeId: user.fridgeId },
      select: {
        id: true,
        name: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    console.log('[OCR] Storage locations:', locations)

    let normalizedItems
    try {
      normalizedItems = await parseReceiptText(receiptText)
      console.log('[OCR] Normalized items:', normalizedItems)
    } catch (parseError) {
      console.error('[OCR] Parse error:', parseError)
      throw new Error(`テキスト正規化エラー: ${parseError instanceof Error ? parseError.message : 'Unknown'}`)
    }

    let items
    try {
      items = await classifyOcrItems(normalizedItems, locations)
      console.log('[OCR] Classified items:', items)
    } catch (classifyError) {
      console.error('[OCR] Classification error:', classifyError)
      throw new Error(`食材分類エラー: ${classifyError instanceof Error ? classifyError.message : 'Unknown'}`)
    }

    return NextResponse.json({ items, sourceText: receiptText })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[OCR] Error:', errorMessage, error)

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: `OCR処理に失敗しました: ${errorMessage}` }, { status: 500 })
  }
}
