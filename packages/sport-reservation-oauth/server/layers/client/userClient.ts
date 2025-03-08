import { RuntimeConfig } from "$/layers";
import { Effect, Layer, Redacted } from "effect";
import {
  UserFetch,
  userClient as _userClient,
  createUserFetch,
} from "sport-reservation-user/client";

export const userClient = /*@__PURE__*/ _userClient.pipe(
  /*@__PURE__*/ Layer.provide(
    /*@__PURE__*/ Layer.effect(
      UserFetch,
      /*@__PURE__*/ Effect.gen(function* () {
        const config = yield* yield* RuntimeConfig;
        return UserFetch.of({
          fetch: createUserFetch({
            baseURL: config.user.baseUrl,
            headers: {
              Authorization: `Bearer ${Redacted.value(config.user.secret)}`,
            },
          }),
        });
      }),
    ),
  ),
);
