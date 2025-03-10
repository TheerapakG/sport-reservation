import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, pipe } from "effect";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UserClient } from "sport-reservation-user/client";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { BaseError, OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { ChatRepository } from "~/repositories/chatRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getChatByGroupId",
  response: response(type({ chatId: "string" }), { stream: false }),
  query: params(
    type({
      groupId: "string",
    }),
  ),
});
export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { groupId },
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

    const userClient = yield* UserClient;
    const groupStatus = yield* userClient.getGroupStatus({
      query: {
        groupId,
        userId,
      },
    });

    if (groupStatus.status !== "member") {
      return yield* Effect.fail(new BaseError("not_member"));
    }

    const chatRepository = yield* ChatRepository;
    const { publicId } = yield* yield* chatRepository.getChatByGroupId(groupId);

    return {
      chatId: publicId,
    };
  }),
);
