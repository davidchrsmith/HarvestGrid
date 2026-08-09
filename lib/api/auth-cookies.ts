import "server-only"

import type { cookies as cookiesFn } from "next/headers"
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE,
} from "./config"

type CookieStore = Awaited<ReturnType<typeof cookiesFn>>

export function setAuthCookies(cookieStore: CookieStore, tokens: { access: string; refresh: string }) {
  const secure = process.env.NODE_ENV === "production"

  cookieStore.set(ACCESS_COOKIE, tokens.access, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE,
  })
  cookieStore.set(REFRESH_COOKIE, tokens.refresh, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  })
}

export function clearAuthCookies(cookieStore: CookieStore) {
  cookieStore.delete(ACCESS_COOKIE)
  cookieStore.delete(REFRESH_COOKIE)
}
