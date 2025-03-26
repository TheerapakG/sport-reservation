import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, pipe } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UserClient } from "sport-reservation-user/client";
import { userProfile } from "sport-reservation-user/models";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { MatchingDbRepository } from "~/repositories/matchingDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getAllMatchedUsers",
  response: response(
    type({
      matches: [
        {
          user: userProfile,
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
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { cursorId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const { client: oauthClient } = yield* OAuthClient;
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);

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
    const matchResults = yield* matchingDbRepository.getCursorMatches(cursorId);

    const userClient = yield* UserClient;

    const matches = yield* Effect.all(
      matchResults
        .filter((match) => match.userId !== userId)
        .map((match) =>
          Effect.gen(function* () {
            const range = match.maxDistance - match.minDistance;
            const normalizedScore =
              range === 0
                ? 100
                : 100 * (1 - (match.distance - match.minDistance) / range);

            return {
              user: yield* userClient.getUserProfile({
                query: { id: match.userId },
              }),
              normalizedScore,
            };
          }),
        ),
    );

    return {
      matches,
    };
  }),
);
