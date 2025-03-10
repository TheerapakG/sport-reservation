import { effectEventHandler, EventContext } from "$/effectEventHandler";
import { Effect, pipe, Stream } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { chatMessage } from "~/models";
import { ChatRepository } from "~/repositories/chatRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getMessagesStream",
  response: response(chatMessage, { stream: true }),
});
export default /*@__PURE__*/ effectEventHandler(handlerConfig)((streamSource) =>
  Effect.gen(function* () {
    const { client: oauthClient } = yield* OAuthClient;
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const id = yield* pipe(
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
    const { subscriptionId, messages } =
      yield* chatRepository.subscribeUserChatMessages(id);

    return streamSource.pipe(
      Stream.zipRight(
        messages.pipe(
          Stream.map(
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
          ),
        ),
      ),
      Stream.concat(
        Stream.drain(
          Stream.finalizer(
            Effect.option(
              chatRepository.unsubscribeUserChatMessages(subscriptionId),
            ),
          ),
        ),
      ),
    );
  }),
);
