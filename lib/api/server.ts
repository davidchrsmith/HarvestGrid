import "server-only"

import { cookies } from "next/headers"
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE,
  backendUrl,
} from "./config"

export class ApiError extends Error {
  status: number
  data: any

  constructor(status: number, data: any) {
    super(typeof data?.detail === "string" ? data.detail : "Request failed")
    this.status = status
    this.data = data
  }
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(backendUrl("/auth/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.access as string
}

/**
 * Server-only fetch wrapper for calling the Django REST API.
 * Reads the access token from the httpOnly cookie, attaches it as a Bearer
 * token, and transparently retries once with a refreshed access token if the
 * first request comes back 401.
 *
 * Use this from Server Components, Server Actions, and Route Handlers only.
 */
export async function apiFetch<T = any>(
  path: string,
  init: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const cookieStore = await cookies()
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value

  const doFetch = async (token: string | undefined) => {
    const headers = new Headers(init.headers)
    headers.set("Content-Type", "application/json")
    if (token && !init.skipAuth) headers.set("Authorization", `Bearer ${token}`)

    return fetch(backendUrl(path), {
      ...init,
      headers,
      cache: "no-store",
    })
  }

  let res = await doFetch(accessToken)

  if (res.status === 401 && !init.skipAuth) {
    const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value
    if (refreshToken) {
      const newAccessToken = await refreshAccessToken(refreshToken)
      if (newAccessToken) {
        cookieStore.set(ACCESS_COOKIE, newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: ACCESS_COOKIE_MAX_AGE,
        })
        res = await doFetch(newAccessToken)
      }
    }
  }

  if (res.status === 204) return undefined as T

  const contentType = res.headers.get("content-type") || ""
  const data = contentType.includes("application/json") ? await res.json() : await res.text()

  if (!res.ok) {
    throw new ApiError(res.status, data)
  }

  return data as T
}

export interface CurrentUser {
  id: string
  email: string
  full_name: string
  organizations: Array<{ id: string; name: string; type: string }>
}

/** Returns the current user, or null if not authenticated. Never throws. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  if (!cookieStore.get(ACCESS_COOKIE)?.value && !cookieStore.get(REFRESH_COOKIE)?.value) {
    return null
  }

  try {
    return await apiFetch<CurrentUser>("/auth/me/")
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return null
    }
    throw err
  }
}
