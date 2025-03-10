import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import {
  userUserGroup,
  userUserGroupMember,
} from "sport-reservation-db/schema";
import { GroupRepository } from "./groupRepository";

export const groupRepositoryImpl = /*@__PURE__*/ Layer.effect(
  GroupRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return GroupRepository.of({
      findGroupById: ({ publicId }) =>
        Effect.gen(function* () {
          const groups = yield* db
            .select()
            .from(userUserGroup)
            .where(
              and(
                isNull(userUserGroup.deletedAt),
                eq(userUserGroup.publicId, publicId),
              ),
            );

          if (groups.length === 0) return Option.none();
          return Option.some(groups[0]);
        }).pipe(Effect.withSpan("groupRepositoryImpl.findGroupById")),
      getGroupMembers: ({ publicId }) =>
        Effect.gen(function* () {
          const members = yield* db
            .select()
            .from(userUserGroupMember)
            .where(
              and(
                isNull(userUserGroupMember.deletedAt),
                eq(userUserGroupMember.groupId, publicId),
                eq(userUserGroupMember.status, "member"),
              ),
            );

          return members;
        }).pipe(Effect.withSpan("groupRepositoryImpl.getGroupMembers")),
      getGroupPendingMembers: ({ publicId }) =>
        Effect.gen(function* () {
          const members = yield* db
            .select()
            .from(userUserGroupMember)
            .where(
              and(
                isNull(userUserGroupMember.deletedAt),
                eq(userUserGroupMember.groupId, publicId),
                eq(userUserGroupMember.status, "pending"),
              ),
            );

          return members;
        }).pipe(Effect.withSpan("groupRepositoryImpl.getGroupPendingMembers")),
      getGroupStatusOfUser: ({ groupId, userId }) =>
        Effect.gen(function* () {
          const status = yield* db
            .select({
              status: userUserGroupMember.status,
            })
            .from(userUserGroupMember)
            .where(
              and(
                isNull(userUserGroupMember.deletedAt),
                eq(userUserGroupMember.groupId, groupId),
                eq(userUserGroupMember.userId, userId),
              ),
            );

          if (status.length === 0) return Option.none();
          return Option.some(status[0]);
        }).pipe(Effect.withSpan("groupRepositoryImpl.getGroupStatusOfUser")),
    });
  }),
);
