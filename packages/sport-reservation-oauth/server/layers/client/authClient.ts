import { RuntimeConfig } from "$/layers";
import { Effect, Layer, Redacted } from "effect";
import {
  AuthFetch,
  authClient as _authClient,
  createAuthFetch,
} from "sport-reservation-auth/client";

export const authClient = /*@__PURE__*/ _authClient.pipe(
  /*@__PURE__*/ Layer.provide(
    /*@__PURE__*/ Layer.effect(
      AuthFetch,
      /*@__PURE__*/ Effect.gen(function* () {
        const config = yield* yield* RuntimeConfig;
        return {
          fetch: createAuthFetch({
            baseURL: config.auth.baseUrl,
            headers: {
              Authorization: `Bearer ${Redacted.value(config.auth.secret)}`,
            },
          }),
        };
      }),
    ),
  ),
);
