import GoogleLoginButton from "./GoogleLoginButton";

export default function LoginForm() {
  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <h1 className="text-center text-2xl font-semibold text-gray-900">
        Welcome back
      </h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        Login with your Google account
      </p>

      {/* Google login */}
      <div className="mt-6">
        <GoogleLoginButton />
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">Or continue with</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Email / password form -- UI only, not wired up yet */}
      <form className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <a
              href="#"
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              Forgot your password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        >
          Login
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <a href="#" className="text-gray-900 underline">
          Sign up
        </a>
      </p>

      <p className="mt-8 text-center text-xs text-gray-400">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
