// app/controllers/trpc_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '#trpc/router'
import { createContext } from '#trpc/trpc'

export default class TrpcController {
  async handle(ctx: HttpContext) {
    const { request, response } = ctx

    const protocol = request.protocol()
    const host = request.header('host')
    const url = `${protocol}://${host}${request.url(true)}`

    const headers = new Headers()
    for (const [key, value] of Object.entries(request.headers())) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(',') : String(value))
      }
    }

    const method = request.method()

    let body: string | undefined = undefined

    if (!['GET', 'HEAD'].includes(method)) {
      const rawBody = request.body()
      if (rawBody && Object.keys(rawBody).length > 0) {
        body = JSON.stringify(rawBody)   
      }
    }

    const fetchRequest = new Request(url, {
      method,
      headers,
      body,  
    })

    const fetchResponse = await fetchRequestHandler({
      endpoint: '/trpc',
      req: fetchRequest,
      router: appRouter,
      createContext: () => createContext({ ctx }),
    })

    response.status(fetchResponse.status)

    fetchResponse.headers.forEach((value, key) => {
      response.header(key, value)
    })

    const responseBody = await fetchResponse.text()
    return response.send(responseBody)
  }
}