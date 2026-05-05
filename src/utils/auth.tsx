
export function saveToken(token: string): void {

  document.cookie = `adminToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
}

export function clearToken(): void {
  document.cookie = "adminToken=; path=/; max-age=0; SameSite=Strict";
}

export function getToken(): string | null {
  
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("adminToken="));
  return match ? match.split("=")[1] : null;
}