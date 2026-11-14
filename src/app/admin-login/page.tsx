import { redirect } from "next/navigation";
import { StoreLayout } from "@/components/store-layout";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/server-auth";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.user.role === "admin") redirect("/admin");

  return (
    <StoreLayout cartEnabled={false}>
      <main className="store-page auth-page">
        <AuthForm adminMode callbackURL="/admin" mode="login" />
      </main>
    </StoreLayout>
  );
}
