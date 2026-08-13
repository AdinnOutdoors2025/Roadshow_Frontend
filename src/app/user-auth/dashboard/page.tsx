"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserAuthGuard } from "@/app/utils/useUserAuthGuard";
import { clearUserToken } from "@/app/utils/userAuth";

export default function UserAuthDashboardPage() {
  const router = useRouter();
  const { user, ready } = useUserAuthGuard();

  const handleLogout = (): void => {
    clearUserToken();
    router.replace("/user-auth/signin");
  };

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          Welcome, {user.username}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Role: {user.role}</p>

        {user.role === "admin" && (
          <Link
            href="/user-auth/admin-panel"
            className="mt-4 inline-block text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Go to Admin Panel
          </Link>
        )}

        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-error-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
