import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import {
  userUserGroup,
  userUserGroupMember,
} from "sport-reservation-db/schema";

export class GroupRepository
  extends /*@__PURE__*/ Context.Tag("GroupRepository")<
    GroupRepository,
    {
      findGroupById: (data: {
        publicId: string;
      }) => Effect.Effect<
        Option.Option<typeof userUserGroup.$inferSelect>,
        SqlError.SqlError
      >;
      getGroupMembers: (data: {
        publicId: string;
      }) => Effect.Effect<
        (typeof userUserGroupMember.$inferSelect)[],
        SqlError.SqlError
      >;
      getGroupPendingMembers: (data: {
        publicId: string;
      }) => Effect.Effect<
        (typeof userUserGroupMember.$inferSelect)[],
        SqlError.SqlError
      >;
      getGroupStatusOfUser: (data: {
        groupId: string;
        userId: string;
      }) => Effect.Effect<
        Option.Option<Pick<typeof userUserGroupMember.$inferSelect, "status">>,
        SqlError.SqlError
      >;
    }
  >() {}
