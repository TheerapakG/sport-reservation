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
  name: "createMatchingCursor",
  response: response(type({ cursorId: "string", createdAt: "string" }), {
    stream: false,
  }),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
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

    const lastCursor = yield* matchingDbRepository.getMatchUserCursor(userId);
    const lastCursorTime = Option.match(lastCursor, {
      onSome: (cursor) => cursor.createdAt.getTime(),
      onNone: () => 0,
    });

    const cursor = yield* yield* Effect.if(
      lastCursorTime + 1000 * 60 * 60 * 24 < Date.now(),
      {
        onTrue: () => Effect.succeed(lastCursor),
        onFalse: () => matchingDbRepository.createMatchUserCursor(userId),
      },
    );

    return {
      cursorId: cursor.publicId,
      createdAt: cursor.createdAt.toISOString(),
    };
  }),
);
