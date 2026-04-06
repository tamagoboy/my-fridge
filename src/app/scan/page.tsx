'use client'

import { ScanConfirmModal } from '@/components/ScanConfirmModal'
import { Button } from '@/components/ui/button'
import { useStorageLocations } from '@/hooks/useFoods'
import type { OcrResultItem } from '@/types/food'
import { Camera, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export default function ScanPage() {
  const { data: storageLocations = [] } = useStorageLocations()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [items, setItems] = useState<OcrResultItem[] | null>(null)

  const handleCameraButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setIsScanning(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

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
      // 同じファイルを再選択できるようにリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900">レシートをスキャン</h1>
        <p className="text-sm text-zinc-600">
          ボタンを押してレシートを撮影すると、商品名を自動で読み取ります。
        </p>
      </div>

      {/* 隠しファイルinput（OSカメラ起動） */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col items-center gap-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        {preview ? (
          <div className="w-full overflow-hidden rounded-2xl border border-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="撮影したレシート" className="w-full object-contain" />
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50">
            <div className="text-center text-zinc-400">
              <Camera className="mx-auto mb-2 size-10" />
              <p className="text-sm">カメラでレシートを撮影</p>
            </div>
          </div>
        )}

        <Button
          onClick={handleCameraButtonClick}
          disabled={isScanning}
          size="lg"
          className="w-full gap-2"
        >
          {isScanning ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              スキャン中...
            </>
          ) : (
            <>
              <Camera className="size-5" />
              {preview ? '撮り直す' : 'レシートをスキャン'}
            </>
          )}
        </Button>
      </div>

      {items ? (
        <ScanConfirmModal
          items={items}
          storageLocations={storageLocations}
          onConfirm={() => {
            setItems(null)
            setPreview(null)
          }}
          onClose={() => setItems(null)}
        />
      ) : null}
    </div>
  )
}
