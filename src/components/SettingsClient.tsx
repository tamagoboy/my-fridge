'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { StorageLocationItem } from '@/types/food'
import { Copy, Loader2, Pencil, Plus, Trash2, UserPlus, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type MemberItem = {
  id: string
  joinedAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface SettingsClientProps {
  userName: string
  userEmail: string
}

export function SettingsClient({ userName, userEmail }: SettingsClientProps) {
  const router = useRouter()
  const [storageLocations, setStorageLocations] = useState<StorageLocationItem[]>([])
  const [members, setMembers] = useState<MemberItem[]>([])
  const [newLocationName, setNewLocationName] = useState('')
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null)
  const [editingLocationName, setEditingLocationName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)
  const [isAddingLocation, setIsAddingLocation] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [locationsResponse, membersResponse] = await Promise.all([
        fetch('/api/storage-locations'),
        fetch('/api/fridge/members'),
      ])

      if (!locationsResponse.ok || !membersResponse.ok) {
        throw new Error('設定データの取得に失敗しました')
      }

      const [locationsData, membersData] = await Promise.all([
        locationsResponse.json(),
        membersResponse.json(),
      ])

      setStorageLocations(locationsData)
      setMembers(membersData)
    } catch {
      toast.error('設定情報の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleCreateInvite = async () => {
    setIsCreatingInvite(true)
    try {
      const response = await fetch('/api/fridge/invite', { method: 'POST' })
      if (!response.ok) {
        throw new Error('招待リンクの発行に失敗しました')
      }

      const data = await response.json()
      const inviteUrl = `${window.location.origin}/invite/${data.token}`
      await navigator.clipboard.writeText(inviteUrl)
      toast.success('招待リンクをクリップボードにコピーしました')
    } catch {
      toast.error('招待リンクの発行に失敗しました')
    } finally {
      setIsCreatingInvite(false)
    }
  }

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      toast.error('保管場所名を入力してください')
      return
    }

    setIsAddingLocation(true)
    try {
      const response = await fetch('/api/storage-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLocationName.trim() }),
      })

      if (!response.ok) {
        throw new Error('保管場所の追加に失敗しました')
      }

      setNewLocationName('')
      await loadData()
      toast.success('保管場所を追加しました')
    } catch {
      toast.error('保管場所の追加に失敗しました')
    } finally {
      setIsAddingLocation(false)
    }
  }

  const handleStartEdit = (location: StorageLocationItem) => {
    setEditingLocationId(location.id)
    setEditingLocationName(location.name)
  }

  const handleSaveLocation = async () => {
    if (!editingLocationId || !editingLocationName.trim()) {
      toast.error('保管場所名を入力してください')
      return
    }

    try {
      const response = await fetch(`/api/storage-locations/${editingLocationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingLocationName.trim() }),
      })

      if (!response.ok) {
        throw new Error('保管場所の更新に失敗しました')
      }

      setEditingLocationId(null)
      setEditingLocationName('')
      await loadData()
      toast.success('保管場所を更新しました')
    } catch {
      toast.error('保管場所の更新に失敗しました')
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    try {
      const response = await fetch(`/api/storage-locations/${locationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('保管場所の削除に失敗しました')
      }

      await loadData()
      toast.success('保管場所を削除しました')
    } catch {
      toast.error('保管場所の削除に失敗しました')
    }
  }

  const handleLeaveFridge = async () => {
    setIsLeaving(true)
    try {
      const response = await fetch('/api/fridge/leave', { method: 'POST' })
      if (!response.ok) {
        throw new Error('離脱に失敗しました')
      }

      toast.success('新しい冷蔵庫を作成して離脱しました')
      router.refresh()
      await loadData()
    } catch {
      toast.error('冷蔵庫からの離脱に失敗しました')
    } finally {
      setIsLeaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-zinc-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-zinc-500">アカウント</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-zinc-950">{userName}</p>
          <p className="mt-1 text-sm text-zinc-600">{userEmail}</p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-zinc-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-zinc-950">
              <Users className="size-4 text-orange-600" />
              冷蔵庫メンバー
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={handleCreateInvite} disabled={isCreatingInvite}>
            {isCreatingInvite ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            招待リンクを発行
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="size-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                <div>
                  <p className="font-medium text-zinc-900">{member.user.name ?? '名前未設定'}</p>
                  <p className="text-sm text-zinc-500">{member.user.email}</p>
                </div>
                <p className="text-xs text-zinc-400">参加日: {new Date(member.joinedAt).toLocaleDateString('ja-JP')}</p>
              </div>
            ))
          )}

          <Alert>
            <Copy className="size-4" />
            <AlertTitle>共有の扱い</AlertTitle>
            <AlertDescription>
              招待リンクは7日間有効です。再発行すると旧リンクは無効になります。
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button variant="destructive" onClick={handleLeaveFridge} disabled={isLeaving}>
              {isLeaving ? <Loader2 className="size-4 animate-spin" /> : null}
              冷蔵庫から離脱する
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-zinc-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-zinc-950">保管場所</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newLocationName}
              onChange={(event) => setNewLocationName(event.target.value)}
              placeholder="例: 野菜室、パントリー"
            />
            <Button onClick={handleAddLocation} disabled={isAddingLocation}>
              {isAddingLocation ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              追加
            </Button>
          </div>

          <div className="space-y-2">
            {storageLocations.map((location) => (
              <div key={location.id} className="flex items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 px-3 py-2">
                {editingLocationId === location.id ? (
                  <>
                    <Input
                      value={editingLocationName}
                      onChange={(event) => setEditingLocationName(event.target.value)}
                    />
                    <Button size="sm" onClick={handleSaveLocation}>保存</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingLocationId(null)}>キャンセル</Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900">{location.name}</p>
                    </div>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleStartEdit(location)} aria-label="保管場所を編集">
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteLocation(location.id)} aria-label="保管場所を削除">
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
