import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin-login?callbackURL=/admin");
  if (session.user.role !== "admin") redirect("/admin-login?callbackURL=/admin");
  return children;
}
