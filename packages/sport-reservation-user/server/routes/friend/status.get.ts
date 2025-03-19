import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Option } from "effect";
import { getQuery, parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { FriendRepository } from "~/repositories/friendRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getFriendStatus",
  response: response(
    type({
      status: "'pending' | 'member' | 'none'",
      groupId: "string?",
    }),
    { stream: false },
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const query = getQuery(event);
    const friendId = query.friendId as string | undefined;

    if (!friendId) {
      return {
        status: "none" as const,
        groupId: undefined,
      };
    }

    const { client: oauthClient } = yield* OAuthClient;

    const userId = yield* Effect.flatMap(
      Effect.promise(async () =>
        getSubjectTypeFromToken({
          type: "user",
          client: oauthClient,
          accessToken,
          refreshToken: undefined,
        }),
      ),
      (user) =>
        user ? Effect.succeed(user.id) : Effect.fail(new OAuthError()),
    );

    const friendRepository = yield* FriendRepository;
    const statusOption = yield* friendRepository.getFriendStatus(
      userId,
      friendId,
    );

    return Option.match(statusOption, {
      onNone: () => ({
        status: "none" as const,
        groupId: undefined,
      }),
      onSome: (status) => status,
    });
  }),
);
