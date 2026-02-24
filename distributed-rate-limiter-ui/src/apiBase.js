const API_BASE_URL = (import.meta.env.VITE_RATE_LIMITER_API_BASE_URL || "").replace(/\/+$/, "");

export function apiUrl(path) {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
