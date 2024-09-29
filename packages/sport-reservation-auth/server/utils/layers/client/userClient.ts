import {
  UserFetch,
  createUserFetch,
  userClient as _userClient,
} from "sport-reservation-user";
import { Effect, Layer } from "effect";

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
