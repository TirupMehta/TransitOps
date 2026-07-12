/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    // -----------------------------------------------------------------------
    // User management routes (JSON body validated with VineJS)
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/', [controllers.Users, 'index'])
        router.post('/', [controllers.Users, 'store'])
        router.get('/:id', [controllers.Users, 'show'])
        router.patch('/:id/profile', [controllers.Users, 'updateProfile'])
        router.patch('/:id/password', [controllers.Users, 'changePassword'])
        router.patch('/:id/active', [controllers.Users, 'setActive'])
        router.delete('/:id', [controllers.Users, 'destroy'])
      })
      .prefix('users')
      .as('users')
      .use(middleware.auth())
  })
  .prefix('/api/v1')

router.any('/trpc/*', [controllers.Trpcs, 'handle'])
