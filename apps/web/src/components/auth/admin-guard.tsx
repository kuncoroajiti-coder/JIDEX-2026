"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "./auth-provider";

export function AdminGuard({
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

    if (user.role !== "ADMIN") {
      if (user.role === "OPERATOR") {
        router.replace("/operator/news");
      } else {
        router.replace("/");
      }
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

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
