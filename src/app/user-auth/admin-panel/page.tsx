"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserAuthGuard } from "@/app/utils/useUserAuthGuard";
import { clearUserToken } from "@/app/utils/userAuth";

export default function UserAuthAdminPanelPage() {
  const router = useRouter();
  const { user, ready } = useUserAuthGuard("admin");

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
          Admin Panel
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Only accounts with the admin role can view this page. Non-admin users attempting to
          load this route are redirected back to the dashboard.
        </p>

        <div className="mt-6 flex gap-4">
          <Link
            href="/user-auth/dashboard"
            className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Back to dashboard
          </Link>
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
