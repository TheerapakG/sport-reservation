import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import { chatChat } from "sport-reservation-db/schema";

export class ChatRepository
  extends /*@__PURE__*/ Context.Tag("ChatRepository")<
    ChatRepository,
    {
      getChat: (
        groupId: string,
      ) => Effect.Effect<
        Option.Option<typeof chatChat.$inferSelect>,
        SqlError.SqlError
      >;
    }
  >() {}
