import { OperatorGuard } from "@/components/auth/operator-guard";

export default function OperatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <OperatorGuard>{children}</OperatorGuard>;
}
