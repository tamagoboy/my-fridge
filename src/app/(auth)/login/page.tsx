import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { authOptions } from "@/lib/auth";
import { Refrigerator } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; detail?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <>
      {/* Background Decorative Elements (Asymmetric) */}
      <div className="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] bg-surface-container-low rounded-full blur-[100px] -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-surface-container-high rounded-full blur-[80px] -z-10"></div>
      
      <main className="w-full max-w-md space-y-12 mx-auto flex flex-col justify-center items-center min-h-screen p-6">
        {/* Error Display */}
        {params.error && (
          <div className="w-full bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 text-sm break-all">
            <p className="font-bold">ログインエラー: {params.error}</p>
            {params.detail && <p className="mt-1">{params.detail}</p>}
          </div>
        )}
        {/* Identity Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-surface-container-lowest editorial-shadow">
            <Refrigerator className="size-12 text-primary" strokeWidth={2.2} />
          </div>
          <div className="space-y-3">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface">my-fridge</h1>
            <p className="font-body text-on-surface-variant max-w-[280px] leading-relaxed mx-auto">
              食材を新鮮に保ち、廃棄を最小限に。
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-xl p-10 editorial-shadow border border-outline-variant/15 flex flex-col items-center space-y-8 w-full">
          {/* Abstract Illustration / Visual Anchor */}
          <div className="w-full h-48 rounded-lg overflow-hidden relative group">
            {/* Using a placeholder or the design layout image */}
            <img
              alt="Fresh ingredients"
              className="w-full h-full object-cover grayscale-[20%] opacity-90 transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlfbB_XssTFPypPUzn12O_i5KpIvoInO_PfSZ7G22wdhjosGN7ByrGwxkI0B7w71p1TrCOoDhSYI0sDAVU4puFqkCqO_sNjhFiKDir41JyLWTIsvobw5ws_pRO-WhdrpzFLQYgIIJR8O1SUYp3cJ_klaRBEKqJK4Umv29pYnPthssffMfL6pPpqFBbuWopQA1nhYqULypV-99Bx5vpEpezN2vpBFfO9mAiuzULoUT0t_FDCihH3Vkl0lNeS6_iq3E6oGKcc0TlFhoo"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/40 to-transparent"></div>
          </div>
          
          <div className="w-full space-y-4">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-outline text-center">おかえりなさい</p>
            <GoogleSignInButton />
          </div>
        </div>

        {/* Footer Footer (Minimalist) */}
        <footer className="flex justify-between items-center px-4 w-full text-center max-w-[300px] mx-auto mt-auto">
          <button className="font-label text-xs font-bold text-on-surface-variant hover:text-primary transition-colors duration-200">
            プライバシーポリシー
          </button>
          <div className="h-1 w-1 bg-outline-variant rounded-full"></div>
          <button className="font-label text-xs font-bold text-on-surface-variant hover:text-primary transition-colors duration-200">
            利用規約
          </button>
          <div className="h-1 w-1 bg-outline-variant rounded-full"></div>
          <button className="font-label text-xs font-bold text-on-surface-variant hover:text-primary transition-colors duration-200">
            ヘルプ
          </button>
        </footer>
      </main>
    </>
  );
}