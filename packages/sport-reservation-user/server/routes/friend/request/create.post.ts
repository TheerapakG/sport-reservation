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
import { OAuthClient } from "~/layers";
import { FriendRepository } from "~/repositories/friendRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateFriendRequest",
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
      toUserId: "string",
    }),
  ),
});

export default effectEventHandler({
  config: handlerConfig,
  handler: () =>
    /*@__PURE__*/ Effect.gen(function* () {
      const { event } = yield* EventContext;
      const { access_token: accessToken } = parseCookies(event);
      const {
        params: {
          body: { toUserId },
        },
      } = yield* EventParamsContext.typed<typeof handlerConfig>();

      const { client: oauthClient } = yield* OAuthClient;

      const user = yield* Effect.promise(async () =>
        getSubjectTypeFromToken({
          type: "user",
          client: oauthClient,
          accessToken,
          refreshToken: undefined,
        }),
      );

      const friendRepository = yield* FriendRepository;
      const members = yield* friendRepository.createFriendRequest(
        user?.id ?? "",
        toUserId,
      );

      return members;
    }),
});
