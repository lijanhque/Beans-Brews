import { StoreLayout } from "@/components/store-layout";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <StoreLayout>
      <main className="store-page auth-page">
        <AuthForm mode="signup" />
      </main>
    </StoreLayout>
  );
}
