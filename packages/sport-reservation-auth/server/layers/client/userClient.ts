import { Effect, Layer } from "effect";
import {
  UserFetch,
  userClient as _userClient,
  createUserFetch,
} from "sport-reservation-user";
import { RuntimeConfig } from "~/layers/config";

export const userClient = _userClient.pipe(
  Layer.provide(
    Layer.effect(
      UserFetch,
      Effect.gen(function* () {
        const config = yield* RuntimeConfig;
        return {
          fetch: createUserFetch({ baseURL: yield* config.user.baseUrl }),
        };
      }),
    ),
  ),
);
