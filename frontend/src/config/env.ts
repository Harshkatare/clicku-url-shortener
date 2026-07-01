export const env = {
    API_URL: import.meta.env.VITE_API_URL,
    SHORT_URL_BASE:
        import.meta.env.VITE_SHORT_URL_BASE,
} as const;

if (!env.API_URL) {
    throw new Error(
        "VITE_API_URL is missing"
    );
}

if (!env.SHORT_URL_BASE) {
    throw new Error(
      "VITE_SHORT_URL_BASE is missing"
    );
  }