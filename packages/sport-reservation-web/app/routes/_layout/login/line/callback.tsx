import { authClient } from '@/utils/client/authClient'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { type } from 'arktype'
import { Effect } from 'effect'
import jwt from 'jsonwebtoken'
import { AuthClient } from 'sport-reservation-auth/client'
import { effectType } from 'sport-reservation-common/utils/effectType'
import { setCookie } from 'vinxi/http'

const renderCallback = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(
        type({
          code: 'string',
          state: 'string',
        }),
        data,
      ),
    ),
  )
  .handler(async ({ data: { code, state } }) => {
    const { token } = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          return yield* (yield* AuthClient).postGetLineLoginAuthToken({
            body: { code, state },
          })
        }),
        authClient,
      ),
    )

    setCookie('token', token, {
      expires: new Date(
        ((jwt.decode(token, { complete: true })?.payload as jwt.JwtPayload)
          ?.exp ?? 0) * 1000,
      ),
      secure: true,
    })

    throw redirect({ to: '/' })
  })

export const Route = createFileRoute('/_layout/login/line/callback')({
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => renderCallback({ data: deps }),
})
