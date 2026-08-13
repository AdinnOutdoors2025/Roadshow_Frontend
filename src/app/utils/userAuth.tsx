// Token storage for the standalone [MODULE] User Authentication flow
// (src/app/user-auth/*). Deliberately isolated from the admin `adminToken`
// cookie in src/app/utils/auth.tsx — the two auth flows must not share a
// cookie name or these helpers would clobber each other's sessions.
const USER_AUTH_COOKIE = "userAuthToken";

export function saveUserToken(token: string): void {
  document.cookie = `${USER_AUTH_COOKIE}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
}

export function clearUserToken(): void {
  document.cookie = `${USER_AUTH_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
}

export function getUserToken(): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${USER_AUTH_COOKIE}=`));
  return match ? match.split("=")[1] : null;
}
