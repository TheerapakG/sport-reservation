import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Option, pipe } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { MatchingDbRepository } from "~/repositories/matchingDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getMatchingCursor",
  response: response(
    type([{ cursorId: "string", createdAt: "string" }, "|", "undefined"]),
    {
      stream: false,
    },
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  pipe(
    Effect.Do,
    Effect.bindAll(() => ({
      oauthClient: pipe(
        OAuthClient,
        Effect.map(({ client }) => client),
      ),
      event: pipe(
        EventContext,
        Effect.map(({ event }) => event),
      ),
      matchingDbRepository: MatchingDbRepository,
    })),
    Effect.let("accessToken", ({ event }) => parseCookies(event).access_token),
    Effect.bind("userId", ({ oauthClient, accessToken }) =>
      pipe(
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
      ),
    ),
    Effect.bind("cursor", ({ matchingDbRepository, userId }) =>
      pipe(
        matchingDbRepository.getMatchUserCursor(userId),
        Effect.map(
          Option.map((cursor) => ({
            cursorId: cursor.publicId,
            createdAt: cursor.createdAt.toISOString(),
          })),
        ),
        Effect.map(Option.getOrUndefined),
      ),
    ),
    Effect.map(({ cursor }) => cursor),
  ),
);
