import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Number, pipe } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { MatchingDbRepository } from "~/repositories/matchingDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "matchUsers",
  response: response(
    type({
      matches: [
        {
          userId: "string",
          distance: "number",
          normalizedScore: "number",
        },
        "[]",
      ],
    }),
    { stream: false },
  ),
  query: params(
    type({
      cursorId: "string",
      limit: "number",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { cursorId, limit },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const { client: oauthClient } = yield* OAuthClient;
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);

    // Verify user is authenticated
    const userId = yield* pipe(
      Effect.promise(() =>
        getSubjectTypeFromToken({
          type: "user",
          client: oauthClient,
          accessToken,
          refreshToken: undefined,
        }),
      ),
      Effect.flatMap((user) =>
        user ? Effect.succeed(user.id) : Effect.fail(new OAuthError()),
      ),
    );

    const matchingDbRepository = yield* MatchingDbRepository;
    const matchResults = yield* matchingDbRepository.matchUser(
      cursorId,
      Number.clamp(limit, { minimum: 1, maximum: 20 }),
    );

    const matches = matchResults
      .filter((match) => match.userId !== userId)
      .map((match) => {
        const range = match.maxDistance - match.minDistance;
        const normalizedScore =
          range === 0
            ? 100
            : 100 * (1 - (match.distance - match.minDistance) / range);

        return {
          userId: match.userId,
          distance: match.distance,
          normalizedScore,
        };
      });

    return {
      matches,
    };
  }),
);
