import { getCurrentUser } from "@/lib/session";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AppPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome, {user?.first_name}
        </h1>
        <LogoutButton />
      </div>
    </div>
  );
}
