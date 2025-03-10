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
import { chatMessage } from "~/models";
import { ChatRepository } from "~/repositories/chatRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getMessages",
  response: response(type([chatMessage, "[]"]), { stream: false }),
  query: params(
    type({
      chatId: "string",
      from: "string.date.parse",
      to: "string.date.parse",
    }),
  ),
});
export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { chatId, from, to },
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

    const chatRepository = yield* ChatRepository;
    const { groupId } = yield* yield* chatRepository.getChatByChatId(chatId);

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
    const messages = yield* chatRepository.getChatMessages({
      chatId,
      from,
      to,
    });

    return messages.map(
      ({
        publicId,
        chatId,
        senderId,
        message,
        imageUrl,
        createdAt,
        updatedAt,
      }) => ({
        id: publicId,
        chatId,
        senderId,
        message,
        imageUrl,
        createdAt,
        updatedAt,
      }),
    );
  }),
);
