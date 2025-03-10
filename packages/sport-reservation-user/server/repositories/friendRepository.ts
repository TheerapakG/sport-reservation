import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import { UnknownException } from "effect/Cause";
import {
  userUserGroup,
  userUserGroupMember,
} from "sport-reservation-db/schema";

export class FriendRepository
  extends /*@__PURE__*/ Context.Tag("FriendRepository")<
    FriendRepository,
    {
      createFriendRequest: (
        fromUserId: string,
        toUserId: string,
      ) => Effect.Effect<
        Pick<
          typeof userUserGroupMember.$inferSelect,
          "groupId" | "userId" | "status"
        >[],
        UnknownException
      >;
      acceptFriendRequest: (
        fromUserId: string,
        toUserId: string,
      ) => Effect.Effect<
        Pick<
          typeof userUserGroupMember.$inferSelect,
          "groupId" | "userId" | "status"
        >[],
        SqlError.SqlError
      >;
      rejectFriendRequest: (
        fromUserId: string,
        toUserId: string,
      ) => Effect.Effect<
        Pick<
          typeof userUserGroupMember.$inferSelect,
          "groupId" | "userId" | "status"
        >[],
        SqlError.SqlError
      >;
      getFriendRequests: (
        userId: string,
      ) => Effect.Effect<
        Pick<
          typeof userUserGroupMember.$inferSelect,
          "groupId" | "userId" | "status"
        >[],
        SqlError.SqlError
      >;
      removeFriend: (
        userId: string,
        friendId: string,
      ) => Effect.Effect<
        Pick<
          typeof userUserGroupMember.$inferSelect,
          "groupId" | "userId" | "status"
        >[],
        SqlError.SqlError
      >;
      getFriends: (
        userId: string,
      ) => Effect.Effect<
        Pick<
          typeof userUserGroupMember.$inferSelect,
          "groupId" | "userId" | "status"
        >[],
        SqlError.SqlError
      >;
      getFriendGroupId: (
        userId: string,
        friendId: string,
      ) => Effect.Effect<
        Option.Option<Pick<typeof userUserGroup.$inferSelect, "publicId">>,
        SqlError.SqlError
      >;
    }
  >() {}
