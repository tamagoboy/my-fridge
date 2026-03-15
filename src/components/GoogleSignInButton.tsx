"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useTransition } from "react";

export function GoogleSignInButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignIn = () => {
    startTransition(async () => {
      await signIn("google", { callbackUrl: "/dashboard" });
    });
  };

  return (
    <Button className="w-full" onClick={handleSignIn} size="lg" disabled={isPending}>
      {isPending ? "Google 認証へ移動中..." : "Google でログイン"}
    </Button>
  );
}