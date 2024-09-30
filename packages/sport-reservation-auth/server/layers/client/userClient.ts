import { Effect, Layer } from "effect";
import {
  UserFetch,
  userClient as _userClient,
  createUserFetch,
} from "sport-reservation-user";
import { RuntimeConfig } from "~/layers/config";

export const userClient = /*@__PURE__*/ _userClient.pipe(
  /*@__PURE__*/ Layer.provide(
    /*@__PURE__*/ Layer.effect(
      UserFetch,
      /*@__PURE__*/ Effect.gen(function* () {
        const config = yield* yield* RuntimeConfig;
        return {
          fetch: createUserFetch({ baseURL: config.user.baseUrl }),
        };
      }),
    ),
  ),
);
