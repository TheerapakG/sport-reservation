import { Effect, Layer } from "effect";
import {
  MatchingFetch,
  matchingClient as _matchingClient,
  createMatchingFetch,
} from "sport-reservation-matching/client";
import { RuntimeConfig } from "../config";

export const matchingClient = /*@__PURE__*/ _matchingClient.pipe(
  /*@__PURE__*/ Layer.provide(
    /*@__PURE__*/ Layer.effect(
      MatchingFetch,
      /*@__PURE__*/ Effect.gen(function* () {
        const config = yield* yield* RuntimeConfig;
        return MatchingFetch.of({
          fetch: createMatchingFetch({
            baseURL: config.matching.baseUrl,
          }),
        });
      }),
    ),
  ),
);
