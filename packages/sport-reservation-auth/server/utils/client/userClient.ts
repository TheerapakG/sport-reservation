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
      Effect.try(() => {
        const config = useRuntimeConfig();
        return {
          fetch: createUserFetch({ baseURL: config.user.BaseUrl }),
        };
      }),
    ),
  ),
);
