// Base URL of the Django REST Framework backend. Override with DJANGO_API_URL in .env.local.
export const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://localhost:8000"

// Cookie names used to store the JWT pair issued by Django's Simple JWT auth endpoints.
// These are httpOnly so client-side JavaScript never has direct access to the tokens.
export const ACCESS_COOKIE = "hg_access_token"
export const REFRESH_COOKIE = "hg_refresh_token"

export const ACCESS_COOKIE_MAX_AGE = 60 * 30 // 30 minutes, matches SIMPLE_JWT ACCESS_TOKEN_LIFETIME
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days, matches SIMPLE_JWT REFRESH_TOKEN_LIFETIME

export function backendUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${DJANGO_API_URL}/api${normalized}`
}
