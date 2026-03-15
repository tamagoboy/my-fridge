import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_28%)] px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold tracking-[0.24em] text-orange-600 uppercase">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            認証が有効になりました
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-600">
            Step 3 で食材一覧をここに実装します。現在はセッション情報と冷蔵庫紐付けの確認用プレースホルダーです。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-3xl border-orange-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-zinc-500">ログイン中のユーザー</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-zinc-950">
                {session.user.name ?? session.user.email}
              </p>
              <p className="mt-1 text-sm text-zinc-600">{session.user.email}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-orange-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-zinc-500">紐付いている冷蔵庫 ID</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="break-all text-sm font-medium text-zinc-950">
                {session.user.fridgeId}
              </p>
            </CardContent>
          </Card>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-xl px-6">
            <Link href="/settings">設定を開く</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}