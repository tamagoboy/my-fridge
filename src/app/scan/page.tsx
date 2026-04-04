'use client'

import { ScanConfirmModal } from '@/components/ScanConfirmModal'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStorageLocations } from '@/hooks/useFoods'
import type { OcrResultItem } from '@/types/food'
import { Camera, Loader2, ScanText } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ScanPage() {
  const { data: storageLocations = [] } = useStorageLocations()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [debugText, setDebugText] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [items, setItems] = useState<OcrResultItem[] | null>(null)

  const handleScan = async () => {
    if (!selectedFile && !debugText.trim()) {
      toast.error('画像または確認用テキストを入力してください')
      return
    }

    setIsScanning(true)
    try {
      const formData = new FormData()
      if (selectedFile) {
        formData.append('image', selectedFile)
      }
      if (debugText.trim()) {
        formData.append('debugText', debugText.trim())
      }

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'OCRに失敗しました')
      }

      setItems(data.items ?? [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OCRに失敗しました')
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 space-y-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900">
          <ScanText className="size-6 text-green-600" />
          レシートをスキャン
        </h1>
        <p className="text-sm leading-6 text-zinc-600">
          画像を選ぶと OCR で商品名を抽出し、保管場所を自動分類します。Vision API 未設定時は下のテキスト欄でも確認できます。
        </p>
      </div>

      <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">レシート画像</label>
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
          {selectedFile ? <p className="text-xs text-zinc-500">選択中: {selectedFile.name}</p> : null}
        </div>

        <Alert>
          <Camera className="size-4" />
          <AlertTitle>開発用フォールバック</AlertTitle>
          <AlertDescription>
            Vision API の資格情報がまだない場合は、レシートのテキストを貼り付けても同じ確認モーダルまで進めます。
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">確認用テキスト</label>
          <textarea
            value={debugText}
            onChange={(event) => setDebugText(event.target.value)}
            placeholder={'牛乳\n卵\n豚こま切れ\n玉ねぎ'}
            className="min-h-40 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-green-500"
          />
        </div>

        <Button onClick={handleScan} disabled={isScanning} className="w-full">
          {isScanning ? <Loader2 className="size-4 animate-spin" /> : <ScanText className="size-4" />}
          OCR を実行する
        </Button>
      </div>

      {items ? (
        <ScanConfirmModal
          items={items}
          storageLocations={storageLocations}
          onConfirm={() => {
            setItems(null)
            setSelectedFile(null)
            setDebugText('')
          }}
          onClose={() => setItems(null)}
        />
      ) : null}
    </div>
  )
}
