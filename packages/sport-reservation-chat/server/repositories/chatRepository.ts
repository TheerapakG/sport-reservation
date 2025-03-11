import { SqlError } from "@effect/sql";
import { Context, Effect, Stream } from "effect";
import { NoSuchElementException, UnknownException } from "effect/Cause";
import { chatChatMessage } from "sport-reservation-db/schema";

export class ChatRepository
  extends /*@__PURE__*/ Context.Tag("ChatRepository")<
    ChatRepository,
    {
      subscribeUserChatMessages: (userId: string) => Effect.Effect<
        {
          subscriptionId: string;
          messages: Stream.Stream<typeof chatChatMessage.$inferSelect>;
        },
        UnknownException | SqlError.SqlError | NoSuchElementException
      >;
      unsubscribeUserChatMessages: (
        subscriptionId: string,
      ) => Effect.Effect<void, UnknownException | SqlError.SqlError>;
      sendChatMessage: (opts: {
        chatId: string;
        senderId: string;
        receiverIds: string[];
        message?: string;
        imageUrl?: string;
      }) => Effect.Effect<
        void,
        UnknownException | SqlError.SqlError | NoSuchElementException
      >;
    }
  >() {}
