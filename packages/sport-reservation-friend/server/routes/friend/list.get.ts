import {
  effectEventHandler,
  EventContext,
  EventParamsContext,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Array } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UserClient } from "sport-reservation-user/client";
import { userProfile } from "sport-reservation-user/models";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { FriendRepository } from "~/repositories/friendRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getFriendList",
  query: params(
    type({
      limit: "number",
      offset: "number",
    }),
  ),
  response: response(
    type({
      friends: [
        {
          user: [userProfile, "|", "undefined"],
          groupId: "string",
          status: "string",
        },
        "[]",
      ],
    }),
    { stream: false },
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const {
      params: { query },
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
    const friends = yield* friendRepository.getFriendsByLimit({
      userId,
      limit: query.limit,
      offset: query.offset,
    });

    const userClient = yield* UserClient;
    const userProfiles = yield* userClient.getUserProfiles({
      query: {
        ids: friends.map((friend) => friend.userId),
      },
    });

    return {
      friends: Array.zip(friends, userProfiles).map(([friend, profile]) => ({
        user: profile,
        groupId: friend.groupId,
        status: friend.status,
      })),
    };
  }),
);
