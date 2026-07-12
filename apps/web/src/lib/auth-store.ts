import type { User } from '../types'

const TOKEN_KEY = 'transit_token'
const USER_KEY = 'transit_user'
const ROLE_MAP_KEY = 'transit_email_roles'

/** Read the stored Bearer token. */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/** Read the stored user object. */
export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

/** Persist token + user and fire an auth-changed event. */
export function saveSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event('auth-changed'))
}

/** Clear token + user and fire an auth-changed event. */
export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('auth-changed'))
}

/** Persist per-email role mapping for quick-select demo accounts. */
export function saveEmailRole(email: string, role: string): void {
  try {
    const map: Record<string, string> = JSON.parse(
      localStorage.getItem(ROLE_MAP_KEY) || '{}'
    )
    map[email.toLowerCase()] = role
    localStorage.setItem(ROLE_MAP_KEY, JSON.stringify(map))
  } catch {
    // Ignore storage errors
  }
}

/** Look up the last used role for a given email. */
export function getEmailRole(email: string): string | null {
  try {
    const map: Record<string, string> = JSON.parse(
      localStorage.getItem(ROLE_MAP_KEY) || '{}'
    )
    return map[email.toLowerCase()] ?? null
  } catch {
    return null
  }
}
