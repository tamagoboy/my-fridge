import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(254,240,138,0.5),_transparent_32%),linear-gradient(135deg,_#fff7ed_0%,_#fffbeb_45%,_#fef2f2_100%)] px-6 py-16">
      <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-orange-950/10 backdrop-blur">
        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.24em] text-orange-600 uppercase">
            myFridge
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            冷蔵庫の状態を
            <br />
            Google アカウントでまとめる
          </h1>
          <p className="text-sm leading-7 text-zinc-600">
            ログインするとユーザー情報を同期し、初回のみ専用の冷蔵庫を自動で作成します。
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <GoogleSignInButton />
          <p className="text-xs leading-6 text-zinc-500">
            開発中は Google OAuth と NEXTAUTH 関連の環境変数が必要です。
          </p>
        </div>

        <div className="mt-10 rounded-2xl bg-orange-50 p-4 text-sm leading-7 text-orange-950">
          <p className="font-medium">このステップで有効になること</p>
          <p>ログイン、セッション保持、未認証ルートのリダイレクト、ログアウト。</p>
        </div>

        <div className="mt-8">
          <Button variant="ghost" asChild className="text-orange-700 hover:text-orange-800 hover:bg-orange-50 -ml-4">
            <Link href="/">トップへ戻る</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}