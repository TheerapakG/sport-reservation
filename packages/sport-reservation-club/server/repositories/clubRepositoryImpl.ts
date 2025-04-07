import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, count, eq, inArray, isNull, not, sql } from "drizzle-orm";
import { Effect, HashMap, Layer } from "effect";
import {
  clubClub,
  userUserGroup,
  userUserGroupMember,
} from "sport-reservation-db/schema";
import { ClubRepository } from "./clubRepository";

export const clubRepositoryImpl = /*@__PURE__*/ Layer.effect(
  ClubRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;

    const clubSizesCTE = (clubIds?: string[]) => {
      const allClubSizes = db.$with("all_club_sizes").as(
        db
          .select({
            clubId: clubClub.groupId,
            size: count(userUserGroupMember.userId).mapWith(Number).as("size"),
          })
          .from(clubClub)
          .innerJoin(
            userUserGroupMember,
            and(eq(clubClub.groupId, userUserGroupMember.groupId)),
          )
          .where(
            and(
              eq(userUserGroupMember.status, "member"),
              isNull(clubClub.deletedAt),
              isNull(userUserGroupMember.deletedAt),
            ),
          )
          .groupBy(clubClub.groupId),
      );

      const clubSizes = db
        .with(allClubSizes)
        .select({
          clubId: clubClub.groupId,
          size: sql`coalesce(${allClubSizes.size}, 0)`
            .mapWith(Number)
            .as("size"),
        })
        .from(clubClub)
        .leftJoin(allClubSizes, eq(clubClub.groupId, allClubSizes.clubId));

      const wheres = [
        clubIds ? inArray(clubClub.groupId, clubIds) : undefined,
      ].filter(Boolean);

      return db
        .$with("club_sizes")
        .as(wheres.length > 0 ? clubSizes.where(and(...wheres)) : clubSizes);
    };

    return ClubRepository.of({
      createClub: ({
        userId,
        name,
        description,
        location,
        locationDescription,
      }) =>
        Effect.gen(function* () {
          const [group] = yield* db
            .insert(userUserGroup)
            .values({
              creatorId: userId,
              name: name,
              type: "club",
            })
            .returning();

          yield* db
            .insert(clubClub)
            .values({
              groupId: group.publicId,
              ...(description ? { description } : {}),
              ...(location ? { location } : {}),
              ...(locationDescription ? { locationDescription } : {}),
            })
            .returning();

          yield* db.insert(userUserGroupMember).values({
            groupId: group.publicId,
            userId: userId,
            status: "member",
          });

          return {
            clubId: group.publicId,
          };
        }).pipe(Effect.withSpan("clubRepositoryImpl.createClub")),
      updateClub: ({
        clubId,
        name,
        description,
        location,
        locationDescription,
      }) =>
        Effect.gen(function* () {
          yield* db
            .update(clubClub)
            .set({
              ...(description ? { description } : {}),
              ...(location ? { location } : {}),
              ...(locationDescription ? { locationDescription } : {}),
            })
            .where(
              and(eq(clubClub.groupId, clubId), isNull(clubClub.deletedAt)),
            );

          if (name) {
            yield* db
              .update(userUserGroup)
              .set({
                name: name,
              })
              .where(
                and(
                  eq(userUserGroup.publicId, clubId),
                  isNull(userUserGroup.deletedAt),
                ),
              );
          }
        }).pipe(Effect.withSpan("clubRepositoryImpl.updateClub")),
      deleteClub: ({ clubId }) =>
        Effect.gen(function* () {
          const groupResult = yield* db
            .select()
            .from(userUserGroup)
            .where(
              and(
                eq(userUserGroup.publicId, clubId),
                isNull(userUserGroup.deletedAt),
              ),
            );

          if (groupResult.length === 0) {
            return false;
          }

          yield* db
            .update(clubClub)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(eq(clubClub.groupId, clubId), isNull(clubClub.deletedAt)),
            );

          yield* db
            .update(userUserGroup)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(userUserGroup.publicId, clubId),
                isNull(userUserGroup.deletedAt),
              ),
            );

          yield* db
            .update(userUserGroupMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(userUserGroupMember.groupId, clubId),
                isNull(userUserGroupMember.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("clubRepositoryImpl.deleteClub")),
      getClubsByIds: ({ clubIds }) =>
        Effect.gen(function* () {
          const clubSizes = clubSizesCTE(clubIds);

          const result = yield* db
            .with(clubSizes)
            .select({
              club: clubClub,
              group: userUserGroup,
              size: clubSizes.size,
            })
            .from(clubClub)
            .innerJoin(
              userUserGroup,
              eq(clubClub.groupId, userUserGroup.publicId),
            )
            .innerJoin(clubSizes, eq(clubClub.groupId, clubSizes.clubId))
            .where(
              and(
                inArray(clubClub.groupId, clubIds),
                isNull(clubClub.deletedAt),
                isNull(userUserGroup.deletedAt),
              ),
            );

          const clubHashmap = HashMap.fromIterable(
            result.map((club) => [club.group.publicId, club]),
          );

          return clubIds.map((clubId) => HashMap.get(clubHashmap, clubId));
        }).pipe(Effect.withSpan("clubRepositoryImpl.getClub")),
      getClubsByLimit: ({ limit, offset }) =>
        Effect.gen(function* () {
          const clubSizes = clubSizesCTE();

          return yield* db
            .with(clubSizes)
            .select({
              club: clubClub,
              group: userUserGroup,
              size: clubSizes.size,
            })
            .from(clubClub)
            .innerJoin(
              userUserGroup,
              eq(clubClub.groupId, userUserGroup.publicId),
            )
            .innerJoin(clubSizes, eq(clubClub.groupId, clubSizes.clubId))
            .where(
              and(isNull(clubClub.deletedAt), isNull(userUserGroup.deletedAt)),
            )
            .limit(limit)
            .offset(offset);
        }).pipe(Effect.withSpan("clubRepositoryImpl.getClub")),
      requestClubMembership: ({ clubId, userId }) =>
        Effect.gen(function* () {
          const club = yield* db
            .select()
            .from(userUserGroup)
            .where(
              and(
                isNull(userUserGroup.deletedAt),
                eq(userUserGroup.publicId, clubId),
                eq(userUserGroup.type, "club"),
              ),
            );

          if (club.length === 0) return;

          yield* db
            .insert(userUserGroupMember)
            .values({
              groupId: clubId,
              userId: userId,
              status: "pending",
            })
            .onConflictDoUpdate({
              target: [userUserGroupMember.groupId, userUserGroupMember.userId],
              set: {
                status: "pending",
              },
              setWhere: and(
                isNull(userUserGroupMember.deletedAt),
                not(eq(userUserGroupMember.status, "member")),
              ),
            })
            .returning();
        }).pipe(Effect.withSpan("clubRepositoryImpl.requestClubMembership")),
      acceptClubMembership: ({ clubId, userId }) =>
        Effect.gen(function* () {
          yield* db
            .update(userUserGroupMember)
            .set({
              status: "member",
            })
            .where(
              and(
                eq(userUserGroupMember.groupId, clubId),
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "pending"),
                isNull(userUserGroupMember.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("clubRepositoryImpl.acceptClubMembership")),
      rejectClubMembership: ({ clubId, userId }) =>
        Effect.gen(function* () {
          yield* db
            .update(userUserGroupMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(userUserGroupMember.groupId, clubId),
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "pending"),
                isNull(userUserGroupMember.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("clubRepositoryImpl.rejectClubMembership")),
      removeMember: ({ clubId, userId }) =>
        Effect.gen(function* () {
          yield* db
            .update(userUserGroupMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(userUserGroupMember.groupId, clubId),
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "member"),
                isNull(userUserGroupMember.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("clubRepositoryImpl.removeMember")),
      getClubMembers: ({ clubId }) =>
        Effect.gen(function* () {
          const club = yield* db
            .select()
            .from(clubClub)
            .where(
              and(isNull(clubClub.deletedAt), eq(clubClub.groupId, clubId)),
            );

          if (club.length === 0) return [];

          const members = yield* db
            .select()
            .from(userUserGroupMember)
            .where(
              and(
                eq(userUserGroupMember.groupId, clubId),
                eq(userUserGroupMember.status, "member"),
                isNull(userUserGroupMember.deletedAt),
              ),
            );

          return members;
        }).pipe(Effect.withSpan("clubRepositoryImpl.getClubMembers")),
      getClubPendingMembers: ({ clubId }) =>
        Effect.gen(function* () {
          const club = yield* db
            .select()
            .from(userUserGroup)
            .where(
              and(
                isNull(userUserGroup.deletedAt),
                eq(userUserGroup.publicId, clubId),
                eq(userUserGroup.type, "club"),
              ),
            );

          if (club.length === 0) return [];

          const pendingMembers = yield* db
            .select()
            .from(userUserGroupMember)
            .where(
              and(
                eq(userUserGroupMember.groupId, clubId),
                eq(userUserGroupMember.status, "pending"),
                isNull(userUserGroupMember.deletedAt),
              ),
            );

          return pendingMembers;
        }).pipe(Effect.withSpan("clubRepositoryImpl.getClubPendingMembers")),
      getUserClubs: ({ userId }) =>
        Effect.gen(function* () {
          const clubSizes = clubSizesCTE();

          return yield* db
            .with(clubSizes)
            .select({
              club: clubClub,
              group: userUserGroup,
              size: clubSizes.size,
            })
            .from(userUserGroupMember)
            .innerJoin(
              userUserGroup,
              eq(userUserGroupMember.groupId, userUserGroup.publicId),
            )
            .innerJoin(clubClub, eq(userUserGroup.publicId, clubClub.groupId))
            .innerJoin(clubSizes, eq(clubClub.groupId, clubSizes.clubId))
            .where(
              and(
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "member"),
                eq(userUserGroup.type, "club"),
                isNull(userUserGroupMember.deletedAt),
                isNull(userUserGroup.deletedAt),
                isNull(clubClub.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("clubRepositoryImpl.getUserClubs")),
      getUserCreatedClubs: ({ userId }) =>
        Effect.gen(function* () {
          const clubSizes = clubSizesCTE();

          return yield* db
            .with(clubSizes)
            .select({
              club: clubClub,
              group: userUserGroup,
              size: clubSizes.size,
            })
            .from(userUserGroup)
            .innerJoin(clubClub, eq(userUserGroup.publicId, clubClub.groupId))
            .innerJoin(clubSizes, eq(clubClub.groupId, clubSizes.clubId))
            .where(
              and(
                eq(userUserGroup.creatorId, userId),
                eq(userUserGroup.type, "club"),
                isNull(userUserGroup.deletedAt),
                isNull(clubClub.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("clubRepositoryImpl.getUserCreatedClubs")),
      getUserMemberClubs: ({ userId }) =>
        Effect.gen(function* () {
          const clubSizes = clubSizesCTE();

          return yield* db
            .with(clubSizes)
            .select({
              club: clubClub,
              group: userUserGroup,
              size: clubSizes.size,
            })
            .from(userUserGroupMember)
            .innerJoin(
              userUserGroup,
              eq(userUserGroupMember.groupId, userUserGroup.publicId),
            )
            .innerJoin(clubClub, eq(userUserGroup.publicId, clubClub.groupId))
            .innerJoin(clubSizes, eq(clubClub.groupId, clubSizes.clubId))
            .where(
              and(
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "member"),
                eq(userUserGroup.type, "club"),
                not(eq(userUserGroup.creatorId, userId)),
                isNull(userUserGroupMember.deletedAt),
                isNull(userUserGroup.deletedAt),
                isNull(clubClub.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("clubRepositoryImpl.getUserMemberClubs")),
      getUserMemberClubsCount: ({ userId }) =>
        Effect.gen(function* () {
          const counts = yield* db
            .select({
              count: count(),
            })
            .from(userUserGroupMember)
            .innerJoin(
              userUserGroup,
              eq(userUserGroupMember.groupId, userUserGroup.publicId),
            )
            .innerJoin(clubClub, eq(userUserGroup.publicId, clubClub.groupId))
            .where(
              and(
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "member"),
                eq(userUserGroup.type, "club"),
                not(eq(userUserGroup.creatorId, userId)),
                isNull(userUserGroupMember.deletedAt),
                isNull(userUserGroup.deletedAt),
                isNull(clubClub.deletedAt),
              ),
            );

          return counts[0].count;
        }).pipe(Effect.withSpan("clubRepositoryImpl.getUserMemberClubsCount")),
      getUserPendingClubs: ({ userId }) =>
        Effect.gen(function* () {
          const clubSizes = clubSizesCTE();

          return yield* db
            .with(clubSizes)
            .select({
              club: clubClub,
              group: userUserGroup,
              size: clubSizes.size,
            })
            .from(userUserGroupMember)
            .innerJoin(
              userUserGroup,
              eq(userUserGroupMember.groupId, userUserGroup.publicId),
            )
            .innerJoin(clubClub, eq(userUserGroup.publicId, clubClub.groupId))
            .innerJoin(clubSizes, eq(clubClub.groupId, clubSizes.clubId))
            .where(
              and(
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "pending"),
                eq(userUserGroup.type, "club"),
                isNull(userUserGroupMember.deletedAt),
                isNull(userUserGroup.deletedAt),
                isNull(clubClub.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("clubRepositoryImpl.getUserPendingClubs")),
      getClubMemberStatus: ({ clubId, userId }) =>
        Effect.gen(function* () {
          const club = yield* db
            .select()
            .from(userUserGroup)
            .where(
              and(
                isNull(userUserGroup.deletedAt),
                eq(userUserGroup.publicId, clubId),
                eq(userUserGroup.type, "club"),
              ),
            );

          if (club.length === 0) return { status: "pending" as const };

          const memberStatus = yield* db
            .select({
              status: userUserGroupMember.status,
            })
            .from(userUserGroupMember)
            .where(
              and(
                eq(userUserGroupMember.groupId, clubId),
                eq(userUserGroupMember.userId, userId),
                isNull(userUserGroupMember.deletedAt),
              ),
            );

          if (memberStatus.length === 0) {
            return { status: "pending" as const };
          }

          return { status: memberStatus[0].status };
        }).pipe(Effect.withSpan("clubRepositoryImpl.getClubMemberStatus")),
    });
  }),
);
