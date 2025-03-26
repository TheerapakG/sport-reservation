import { Effect, Layer } from "effect";
import {
  FriendFetch,
  friendClient as _friendClient,
  createFriendFetch,
} from "sport-reservation-friend/client";
import { RuntimeConfig } from "../config";

export const friendClient = /*@__PURE__*/ _friendClient.pipe(
  /*@__PURE__*/ Layer.provide(
    /*@__PURE__*/ Layer.effect(
      FriendFetch,
      /*@__PURE__*/ Effect.gen(function* () {
        const config = yield* yield* RuntimeConfig;
        return FriendFetch.of({
          fetch: createFriendFetch({
            baseURL: config.friend.baseUrl,
          }),
        });
      }),
    ),
  ),
);
