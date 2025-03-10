import { SqlError } from "@effect/sql";
import { Context, Effect, Option, Stream } from "effect";
import { UnknownException } from "effect/Cause";
import { chatChat, chatChatMessage } from "sport-reservation-db/schema";

export class ChatRepository
  extends /*@__PURE__*/ Context.Tag("ChatRepository")<
    ChatRepository,
    {
      getChatByGroupId: (
        groupId: string,
      ) => Effect.Effect<
        Option.Option<typeof chatChat.$inferSelect>,
        SqlError.SqlError
      >;
      getChatByChatId: (
        chatId: string,
      ) => Effect.Effect<
        Option.Option<typeof chatChat.$inferSelect>,
        SqlError.SqlError
      >;
      subscribeUserChatMessages: (userId: string) => Effect.Effect<
        {
          subscriptionId: string;
          messages: Stream.Stream<typeof chatChatMessage.$inferSelect>;
        },
        UnknownException | SqlError.SqlError
      >;
      unsubscribeUserChatMessages: (
        subscriptionId: string,
      ) => Effect.Effect<void, UnknownException | SqlError.SqlError>;
      getChatMessages: (opts: {
        chatId: string;
        from: Date;
        to: Date;
      }) => Effect.Effect<
        Array<typeof chatChatMessage.$inferSelect>,
        SqlError.SqlError
      >;
      sendChatMessage: (opts: {
        chatId: string;
        senderId: string;
        receiverIds: string[];
        message?: string;
        imageUrl?: string;
      }) => Effect.Effect<void, UnknownException | SqlError.SqlError>;
    }
  >() {}
