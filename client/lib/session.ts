import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

export interface User {
  id: string;
  google_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value ?? null;
}

/**
 * Server-only helper for Server Components / Route Handlers. Forwards the
 * accessToken cookie from the incoming request as a manual Cookie header,
 * since a server-to-server fetch doesn't automatically carry the browser's
 * cookies the way a client-side fetch with credentials: "include" does.
 * Returns null if there's no session or the token has expired — callers
 * decide what to do about that (redirect, show a logged-out state, etc.)
 */
export async function getCurrentUser(): Promise<User | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  const res = await fetch(`${API_URL}/api/v1/me`, {
    headers: { Cookie: `accessToken=${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}
