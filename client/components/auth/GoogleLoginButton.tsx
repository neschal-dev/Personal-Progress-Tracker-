import GoogleLogo from "./GoogleLogo";

/**
 * The Google OAuth login endpoint on the backend.
 * This MUST be a real, top-level browser navigation (a plain <a> tag),
 * not a fetch() call — the flow relies on a session cookie being set
 * on this request and read back on the callback request.
 */
const GOOGLE_AUTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`;

export default function GoogleLoginButton() {
  return (
    <a
      href={GOOGLE_AUTH_URL}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
    >
      <GoogleLogo />
      Login with Google
    </a>
  );
}
