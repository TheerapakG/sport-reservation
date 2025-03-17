import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull, not, sql } from "drizzle-orm";
import { intersect } from "drizzle-orm/pg-core";
import { Effect, Layer, Option } from "effect";
import {
  userUserGroup,
  userUserGroupMember,
} from "sport-reservation-db/schema";
import { FriendRepository } from "./friendRepository";

export const friendRepositoryImpl = /*@__PURE__*/ Layer.effect(
  FriendRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return FriendRepository.of({
      createFriendRequest: (fromUserId, toUserId) =>
        Effect.gen(function* () {
          const group = db.$with("group").as(
            db
              .insert(userUserGroup)
              .values({
                creatorId: fromUserId,
                type: "friend",
              })
              .returning({
                publicId: userUserGroup.publicId,
              }),
          );

          const members = yield* db
            .with(group)
            .insert(userUserGroupMember)
            .values([
              {
                groupId: sql`(select * from ${group})`,
                userId: fromUserId,
                status: "member",
              },
              {
                groupId: sql`(select * from ${group})`,
                userId: toUserId,
                status: "pending",
              },
            ])
            .returning({
              groupId: userUserGroupMember.groupId,
              userId: userUserGroupMember.userId,
              status: userUserGroupMember.status,
            });

          return members;
        }).pipe(Effect.withSpan("friendRepositoryImpl.createFriendRequest")),
      acceptFriendRequest: (fromUserId, toUserId) =>
        Effect.gen(function* () {
          const userFriendGroupIds = db.$with("user_friend_group_ids").as(
            intersect(
              db
                .select({ id: userUserGroup.publicId })
                .from(userUserGroup)
                .innerJoin(
                  userUserGroupMember,
                  eq(userUserGroup.publicId, userUserGroupMember.groupId),
                )
                .where(
                  and(
                    isNull(userUserGroup.deletedAt),
                    isNull(userUserGroupMember.deletedAt),
                    eq(userUserGroup.type, "friend"),
                    eq(userUserGroupMember.userId, fromUserId),
                    eq(userUserGroupMember.status, "member"),
                  ),
                ),
              db
                .select({ id: userUserGroup.publicId })
                .from(userUserGroup)
                .innerJoin(
                  userUserGroupMember,
                  eq(userUserGroup.publicId, userUserGroupMember.groupId),
                )
                .where(
                  and(
                    isNull(userUserGroup.deletedAt),
                    isNull(userUserGroupMember.deletedAt),
                    eq(userUserGroup.type, "friend"),
                    eq(userUserGroupMember.userId, toUserId),
                    eq(userUserGroupMember.status, "pending"),
                  ),
                ),
            ),
          );
          const members = yield* db
            .with(userFriendGroupIds)
            .update(userUserGroupMember)
            .set({
              status: "member",
            })
            .where(
              and(
                isNull(userUserGroupMember.deletedAt),
                eq(userUserGroupMember.groupId, userFriendGroupIds.id),
                eq(userUserGroupMember.userId, toUserId),
              ),
            )
            .returning({
              groupId: userUserGroupMember.groupId,
              userId: userUserGroupMember.userId,
              status: userUserGroupMember.status,
            });
          return members;
        }).pipe(Effect.withSpan("friendRepositoryImpl.acceptFriendRequest")),
      rejectFriendRequest: (fromUserId, toUserId) =>
        Effect.gen(function* () {
          const userFriendGroupIds = db.$with("user_friend_group_ids").as(
            intersect(
              db
                .select({ id: userUserGroup.publicId })
                .from(userUserGroup)
                .innerJoin(
                  userUserGroupMember,
                  eq(userUserGroup.publicId, userUserGroupMember.groupId),
                )
                .where(
                  and(
                    isNull(userUserGroup.deletedAt),
                    isNull(userUserGroupMember.deletedAt),
                    eq(userUserGroup.type, "friend"),
                    eq(userUserGroupMember.userId, fromUserId),
                    eq(userUserGroupMember.status, "member"),
                  ),
                ),
              db
                .select({ id: userUserGroup.publicId })
                .from(userUserGroup)
                .innerJoin(
                  userUserGroupMember,
                  eq(userUserGroup.publicId, userUserGroupMember.groupId),
                )
                .where(
                  and(
                    isNull(userUserGroup.deletedAt),
                    isNull(userUserGroupMember.deletedAt),
                    eq(userUserGroup.type, "friend"),
                    eq(userUserGroupMember.userId, toUserId),
                    eq(userUserGroupMember.status, "pending"),
                  ),
                ),
            ),
          );
          const members = yield* db
            .with(userFriendGroupIds)
            .update(userUserGroupMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                isNull(userUserGroupMember.deletedAt),
                eq(userUserGroupMember.groupId, userFriendGroupIds.id),
                eq(userUserGroupMember.userId, toUserId),
              ),
            )
            .returning({
              groupId: userUserGroupMember.groupId,
              userId: userUserGroupMember.userId,
              status: userUserGroupMember.status,
            });
          return members;
        }).pipe(Effect.withSpan("friendRepositoryImpl.rejectFriendRequest")),
      getFriendRequests: (userId) =>
        Effect.gen(function* () {
          const userFriendGroupIds = db.$with("user_friend_group_ids").as(
            db
              .select({ id: userUserGroup.publicId })
              .from(userUserGroup)
              .innerJoin(
                userUserGroupMember,
                eq(userUserGroup.publicId, userUserGroupMember.groupId),
              )
              .where(
                and(
                  isNull(userUserGroup.deletedAt),
                  isNull(userUserGroupMember.deletedAt),
                  eq(userUserGroup.type, "friend"),
                  eq(userUserGroupMember.userId, userId),
                  eq(userUserGroupMember.status, "pending"),
                ),
              ),
          );

          return yield* db
            .with(userFriendGroupIds)
            .select({
              groupId: userUserGroupMember.groupId,
              userId: userUserGroupMember.userId,
              status: userUserGroupMember.status,
            })
            .from(userUserGroupMember)
            .where(
              and(
                isNull(userUserGroupMember.deletedAt),
                eq(userUserGroupMember.groupId, userFriendGroupIds.id),
                not(eq(userUserGroupMember.userId, userId)),
              ),
            );
        }).pipe(Effect.withSpan("friendRepositoryImpl.getFriendRequests")),
      removeFriend: (userId, friendId) =>
        Effect.gen(function* () {
          const userFriendGroupIds = db.$with("user_friend_group_ids").as(
            intersect(
              db
                .select({ id: userUserGroup.publicId })
                .from(userUserGroup)
                .innerJoin(
                  userUserGroupMember,
                  eq(userUserGroup.publicId, userUserGroupMember.groupId),
                )
                .where(
                  and(
                    isNull(userUserGroup.deletedAt),
                    isNull(userUserGroupMember.deletedAt),
                    eq(userUserGroup.type, "friend"),
                    eq(userUserGroupMember.userId, userId),
                    eq(userUserGroupMember.status, "member"),
                  ),
                ),
              db
                .select({ id: userUserGroup.publicId })
                .from(userUserGroup)
                .innerJoin(
                  userUserGroupMember,
                  eq(userUserGroup.publicId, userUserGroupMember.groupId),
                )
                .where(
                  and(
                    isNull(userUserGroup.deletedAt),
                    isNull(userUserGroupMember.deletedAt),
                    eq(userUserGroup.type, "friend"),
                    eq(userUserGroupMember.userId, friendId),
                    eq(userUserGroupMember.status, "member"),
                  ),
                ),
            ),
          );
          const members = yield* db
            .with(userFriendGroupIds)
            .update(userUserGroupMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                isNull(userUserGroupMember.deletedAt),
                eq(userUserGroupMember.groupId, userFriendGroupIds.id),
                eq(userUserGroupMember.userId, userId),
              ),
            )
            .returning({
              groupId: userUserGroupMember.groupId,
              userId: userUserGroupMember.userId,
              status: userUserGroupMember.status,
            });
          return members;
        }).pipe(Effect.withSpan("friendRepositoryImpl.removeFriend")),
      getFriends: (userId) =>
        Effect.gen(function* () {
          const userFriendGroupIds = db.$with("user_friend_group_ids").as(
            db
              .select({ id: userUserGroup.publicId })
              .from(userUserGroup)
              .innerJoin(
                userUserGroupMember,
                eq(userUserGroup.publicId, userUserGroupMember.groupId),
              )
              .where(
                and(
                  isNull(userUserGroup.deletedAt),
                  isNull(userUserGroupMember.deletedAt),
                  eq(userUserGroup.type, "friend"),
                  eq(userUserGroupMember.userId, userId),
                  eq(userUserGroupMember.status, "member"),
                ),
              ),
          );

          return yield* db
            .with(userFriendGroupIds)
            .select({
              groupId: userUserGroupMember.groupId,
              userId: userUserGroupMember.userId,
              status: userUserGroupMember.status,
            })
            .from(userUserGroupMember)
            .where(
              and(
                isNull(userUserGroupMember.deletedAt),
                eq(userUserGroupMember.groupId, userFriendGroupIds.id),
                not(eq(userUserGroupMember.userId, userId)),
              ),
            );
        }).pipe(Effect.withSpan("friendRepositoryImpl.getFriends")),
      getFriendGroupId: (userId, friendId) =>
        Effect.gen(function* () {
          const userFriendGroupIds = yield* intersect(
            db
              .select({ publicId: userUserGroup.publicId })
              .from(userUserGroup)
              .innerJoin(
                userUserGroupMember,
                eq(userUserGroup.publicId, userUserGroupMember.groupId),
              )
              .where(
                and(
                  isNull(userUserGroup.deletedAt),
                  isNull(userUserGroupMember.deletedAt),
                  eq(userUserGroup.type, "friend"),
                  eq(userUserGroupMember.userId, userId),
                  eq(userUserGroupMember.status, "member"),
                ),
              ),
            db
              .select({ publicId: userUserGroup.publicId })
              .from(userUserGroup)
              .innerJoin(
                userUserGroupMember,
                eq(userUserGroup.publicId, userUserGroupMember.groupId),
              )
              .where(
                and(
                  isNull(userUserGroup.deletedAt),
                  isNull(userUserGroupMember.deletedAt),
                  eq(userUserGroup.type, "friend"),
                  eq(userUserGroupMember.userId, friendId),
                  eq(userUserGroupMember.status, "member"),
                ),
              ),
          );

          if (userFriendGroupIds.length === 0) return Option.none();
          return Option.some(userFriendGroupIds[0]);
        }).pipe(Effect.withSpan("friendRepositoryImpl.getFriendGroup")),
    });
  }),
);
