import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is the real auth check — middleware.ts only did a fast presence
  // check on the cookie, not signature/expiry verification. If the token
  // is missing, invalid, or expired, getCurrentUser() returns null here
  // and we bounce back to login.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return <AuthProvider initialUser={user}>{children}</AuthProvider>;
}
