const TOKEN_KEY = "token";

// In-memory fallback if localStorage is restricted (e.g., Safari private browsing)
let inMemoryToken: string | null = null;
let isStorageAvailable: boolean | null = null;

function hasStorage(): boolean {
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function checkStorage(): boolean {
  if (isStorageAvailable === null) {
    isStorageAvailable =
      typeof window !== "undefined" && "localStorage" in window && hasStorage();
  }
  return isStorageAvailable;
}

export function getToken(): string | null {
  if (!checkStorage()) {
    return inMemoryToken;
  }
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? inMemoryToken;
  } catch {
    return inMemoryToken;
  }
}

export function saveToken(token: string): void {
  inMemoryToken = token;
  if (!checkStorage()) return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage restricted or quota exceeded
  }
}

export function removeToken(): void {
  inMemoryToken = null;
  if (!checkStorage()) return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage restricted
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

