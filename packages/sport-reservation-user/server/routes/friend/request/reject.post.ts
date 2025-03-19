import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { FriendRepository } from "~/repositories/friendRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postRejectFriendRequest",
  response: response(
    type(
      {
        groupId: "string",
        userId: "string",
        status: "string",
      },
      "[]",
    ),
    { stream: false },
  ),
  body: params(
    type({
      fromUserId: "string",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const {
      params: {
        body: { fromUserId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

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
    const members = yield* friendRepository.rejectFriendRequest(
      fromUserId,
      userId,
    );
    return members;
  }),
);
