"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "./auth-provider";

export function OperatorGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (
      user.role !== "OPERATOR" &&
      user.role !== "ADMIN"
    ) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-slate-500">
          Checking access...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (
    user.role !== "OPERATOR" &&
    user.role !== "ADMIN"
  ) {
    return null;
  }

  return <>{children}</>;
}
