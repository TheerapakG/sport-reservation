import { RuntimeConfig } from "$/layers";
import { Effect, Layer } from "effect";
import {
  clubClient as _clubClient,
  ClubFetch,
  createClubFetch,
} from "sport-reservation-club/client";

export const clubClient = /*@__PURE__*/ _clubClient.pipe(
  /*@__PURE__*/ Layer.provide(
    /*@__PURE__*/ Layer.effect(
      ClubFetch,
      /*@__PURE__*/ Effect.gen(function* () {
        const config = yield* yield* RuntimeConfig;
        return ClubFetch.of({
          fetch: createClubFetch({
            baseURL: config.club.baseUrl,
          }),
        });
      }),
    ),
  ),
);
