const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  // Coalesce concurrent 401s into a single refresh call rather than firing
  // one refresh request per failed request that happened to land at once
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/**
 * Client-side fetch wrapper for Client Components. Sends the httpOnly
 * cookies automatically via credentials: "include" — there's no token to
 * read or attach manually. On a 401 (expired access token), it attempts
 * one silent refresh and retries the original request once before giving
 * up, so a 15-minute access token expiry doesn't interrupt the user.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
    });

  let res = await doFetch();

  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await doFetch();
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export { ApiError };
