"use client";

import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();
  const { setUser } = useAuth();

  async function handleLogout() {
    // Clears the httpOnly cookies server-side — nothing to remove client-side
    await apiFetch("/api/v1/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh(); // re-runs Server Components so stale server state clears too
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      Log out
    </Button>
  );
}
