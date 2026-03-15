"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useTransition } from "react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut({ callbackUrl: "/login" });
    });
  };

  return (
    <Button onClick={handleSignOut} variant="outline" disabled={isPending}>
      {isPending ? "ログアウト中..." : "ログアウト"}
    </Button>
  );
}