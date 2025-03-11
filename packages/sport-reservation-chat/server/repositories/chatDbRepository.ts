import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import { UnknownException } from "effect/Cause";
import {
  chatChat,
  chatChatMessage,
  chatChatSubscription,
} from "sport-reservation-db/schema";

export class ChatDbRepository
  extends /*@__PURE__*/ Context.Tag("ChatDbRepository")<
    ChatDbRepository,
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
      getUsersPartitions: (
        userIds: string[],
      ) => Effect.Effect<
        Pick<
          typeof chatChatSubscription.$inferSelect,
          "partition" | "userId"
        >[],
        UnknownException | SqlError.SqlError
      >;
      setUserChatMessagesSubscription: (
        userId: string,
        partition: number,
      ) => Effect.Effect<
        Option.Option<
          Pick<typeof chatChatSubscription.$inferSelect, "publicId">
        >,
        UnknownException | SqlError.SqlError
      >;
      setSubscriptionsPartition: (opts: {
        subscriptionIds: string[];
        partition: number;
      }) => Effect.Effect<void, UnknownException | SqlError.SqlError>;
      deleteUserChatMessagesSubscription: (
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
      addChatMessage: (opts: {
        chatId: string;
        senderId: string;
        message?: string;
        imageUrl?: string;
      }) => Effect.Effect<
        Option.Option<typeof chatChatMessage.$inferSelect>,
        UnknownException | SqlError.SqlError
      >;
    }
  >() {}
