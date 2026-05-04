export function saveToken(token: string): void {
  localStorage.setItem("adminToken", token);
  document.cookie = `adminToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export function clearToken(): void {
  localStorage.removeItem("adminToken");
  document.cookie = "adminToken=; path=/; max-age=0";
}

export function getToken(): string | null {
  return localStorage.getItem("adminToken");
}