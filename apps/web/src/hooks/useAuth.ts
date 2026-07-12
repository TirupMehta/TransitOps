import useSWR, { mutate } from 'swr'
import { toast } from 'sonner'
import axiosInstance, { axiosFetcher } from '../lib/axios'
import { saveSession, clearSession, getToken, getUser, saveEmailRole, getEmailRole } from '../lib/auth-store'
import { login as mockLogin, signup as mockSignup } from '../utils/api'
import type { User } from '../types'

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Shape returned by POST /api/v1/auth/login
 * { type: 'bearer', value: '<token>', expiresAt: ..., user: { ... } }
 */
interface BackendLoginResponse {
  type: string
  value: string           // the raw token string
  expiresAt: string | null
  user: {
    id: number
    fullName: string | null
    email: string
    mobile: string
    userType: string
    isActive: boolean
  }
}

/**
 * Shape returned by POST /api/v1/auth/signup (via serialize())
 * { user: { ... }, token: '<raw-string>' }
 */
interface BackendSignupResponse {
  token: string           // plain string, not an object
  user: {
    id: number
    fullName: string | null
    email: string
    mobile?: string
    userType?: string
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * `useAuth` — central authentication hook.
 *
 * - Uses SWR to reactively cache the current user.
 * - Tries the real backend first; silently falls back to localStorage mocks.
 * - Exposes `login`, `signup`, `logout` mutations that show Sonner toasts.
 */
export function useAuth() {
  const { data: user, isLoading, mutate: mutateUser } = useSWR<User | null>(
    'auth/current-user',
    () => {
      // SWR fetcher: read from localStorage (already populated by login/signup)
      return Promise.resolve(getUser())
    },
    {
      fallbackData: getUser(),
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const token = getToken()
  const isAuthenticated = Boolean(user && token)

  // ── Login ──────────────────────────────────────────────────────────────────

  async function login(
    email: string,
    password: string,
    selectedRole?: string
  ): Promise<{ user: User; token: string }> {
    try {
      // Try real backend first
      const { data } = await axiosInstance.post<BackendLoginResponse>(
        '/auth/login',
        { email, password }
      )

      const rawToken = data.value
      const roleToSave = selectedRole ?? getEmailRole(email) ?? 'Fleet Manager'

      const authedUser: User = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName,
        role: roleToSave,
        initials: (data.user.fullName ?? email)
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      }

      saveSession(rawToken, authedUser)
      saveEmailRole(email, roleToSave)
      await mutateUser(authedUser)
      mutate('auth/current-user') // revalidate globally

      toast.success(`Welcome back, ${authedUser.fullName ?? authedUser.email}!`, {
        description: `Signed in as ${roleToSave}`,
      })

      return { user: authedUser, token: rawToken }
    } catch (backendError) {
      // Fallback to mock/local implementation
      try {
        const result = await mockLogin(email, password, selectedRole)
        await mutateUser(result.user)

        toast.success(`Welcome, ${result.user.fullName ?? result.user.email}!`, {
          description: `Signed in as ${result.user.role} (demo mode)`,
        })

        return result
      } catch (mockError: any) {
        const msg = mockError?.message ?? 'Invalid email or password'
        toast.error('Sign in failed', { description: msg })
        throw mockError
      }
    }
  }

  // ── Sign Up ────────────────────────────────────────────────────────────────

  async function signup(
    fullName: string,
    email: string,
    password: string,
    role: string
  ): Promise<{ user: User; token: string }> {
    try {
      // Try real backend first
      const { data } = await axiosInstance.post<BackendSignupResponse>(
        '/auth/signup',
        {
          fullName,
          email,
          password,
          passwordConfirmation: password,
        }
      )

      // Backend returns: { user: {...}, token: '<raw-string>' }
      const rawToken = data.token
      const authedUser: User = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName,
        role,
        initials: fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      }

      saveSession(rawToken, authedUser)
      saveEmailRole(email, role)
      await mutateUser(authedUser)
      mutate('auth/current-user')

      toast.success('Account created!', {
        description: `Welcome to TransitOps, ${authedUser.fullName}!`,
      })

      return { user: authedUser, token: rawToken }
    } catch (backendError) {
      try {
        const result = await mockSignup(fullName, email, password, role)
        await mutateUser(result.user)

        toast.success('Account created (demo mode)!', {
          description: `Welcome, ${result.user.fullName}!`,
        })

        return result
      } catch (mockError: any) {
        const msg = mockError?.message ?? 'Sign up failed'
        toast.error('Sign up failed', { description: msg })
        throw mockError
      }
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  async function logout(): Promise<void> {
    try {
      await axiosInstance.post('/account/logout')
    } catch {
      // Best-effort — still clear local state
    } finally {
      clearSession()
      await mutateUser(null)
      mutate('auth/current-user')
      toast.info('You have been signed out.')
    }
  }

  // ── Fetch profile from backend (SWR) ───────────────────────────────────────

  const { data: serverProfile } = useSWR(
    isAuthenticated ? '/account/profile' : null,
    () => axiosFetcher<{ id: number; fullName: string; email: string }>('/account/profile'),
    { onError: () => {} } // Silently ignore if backend is offline
  )

  return {
    user: user ?? null,
    token,
    isAuthenticated,
    isLoading,
    serverProfile: serverProfile ?? null,
    login,
    signup,
    logout,
    mutateUser,
  }
}
