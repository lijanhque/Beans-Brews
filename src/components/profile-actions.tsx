"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function ProfileActions() {
  const router = useRouter();

  async function signOut() {
    const result = await authClient.signOut();
    if (result.error) {
      console.error("Could not sign out:", result.error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <button className="button-outline profile-signout" onClick={signOut} type="button">
      Sign out
    </button>
  );
}
