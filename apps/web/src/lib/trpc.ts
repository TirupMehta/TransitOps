import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { getToken } from './auth-store'

const TRPC_URL = 'http://localhost:3333/trpc'

/**
 * Vanilla tRPC client pre-configured with Bearer token injection.
 *
 * Usage example:
 *   const me = await trpcClient.user.me.query()
 *
 * For React-Query hooks (trpc.user.me.useQuery()), upgrade to a typed
 * AppRouter once the backend exposes a clean type-only export that does
 * not pull in AdonisJS decorator-dependent model files.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpcClient = createTRPCClient<any>({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      headers() {
        const token = getToken()
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})
