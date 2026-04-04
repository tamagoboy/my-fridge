import { SettingsClient } from '@/components/SettingsClient'
import { SignOutButton } from "@/components/SignOutButton";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-[0.24em] text-orange-600 uppercase">
            Settings
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">設定</h1>
          <p className="text-sm leading-7 text-zinc-600">
            アカウント確認、メンバー共有、保管場所管理をここで行えます。
          </p>
        </div>

        <SettingsClient
          userName={session.user.name ?? '名前未設定'}
          userEmail={session.user.email ?? ''}
        />

        <div className="flex items-center gap-3">
          <SignOutButton />
          <Button variant="ghost" asChild className="text-orange-700 hover:text-orange-800 hover:bg-orange-50">
            <Link href="/dashboard">ダッシュボードへ戻る</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}