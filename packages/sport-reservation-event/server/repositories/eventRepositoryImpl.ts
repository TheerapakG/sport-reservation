import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { type } from "arktype";
import { and, eq, isNull, not, sql, sum } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import {
  eventEvent,
  eventEventMember,
  userUserGroup,
  userUserGroupMember,
} from "sport-reservation-db/schema";
import { effectType } from "tiara-stack/utils/effectType";
import { EventRepository } from "./eventRepository";

export const eventRepositoryImpl = /*@__PURE__*/ Layer.effect(
  EventRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;

    return EventRepository.of({
      createEventByUser: ({
        userId,
        name,
        description,
        location,
        locationDescription,
        startAt,
        endAt,
        autoAccept,
        sizeLimit,
      }) =>
        Effect.gen(function* () {
          const [group] = yield* db
            .insert(userUserGroup)
            .values({
              creatorId: userId,
              name,
              type: "event",
            })
            .returning();

          const [event] = yield* db
            .insert(eventEvent)
            .values({
              eventCreatorType: "user",
              creatorId: userId,
              groupId: group.publicId,
              description,
              location,
              locationDescription,
              startAt,
              endAt,
              autoAccept,
              sizeLimit,
            })
            .returning();

          yield* db.insert(userUserGroupMember).values({
            groupId: group.publicId,
            userId,
            status: "member",
          });

          return {
            eventId: event.groupId,
          };
        }).pipe(Effect.withSpan("eventRepositoryImpl.createEventByUser")),
      createEventByClub: ({
        clubId,
        name,
        description,
        location,
        locationDescription,
        startAt,
        endAt,
        autoAccept,
        sizeLimit,
      }) =>
        Effect.gen(function* () {
          const clubGroup = yield* db
            .select()
            .from(userUserGroup)
            .where(
              and(
                eq(userUserGroup.publicId, clubId),
                eq(userUserGroup.type, "club"),
                isNull(userUserGroup.deletedAt),
              ),
            );

          if (clubGroup.length === 0) {
            return Option.none();
          }

          const [group] = yield* db
            .insert(userUserGroup)
            .values({
              creatorId: clubGroup[0].creatorId,
              name,
              type: "event",
            })
            .returning();

          const [event] = yield* db
            .insert(eventEvent)
            .values({
              eventCreatorType: "club",
              creatorId: clubGroup[0].publicId,
              groupId: group.publicId,
              description,
              location,
              locationDescription,
              startAt,
              endAt,
              autoAccept,
              sizeLimit,
            })
            .returning();

          return Option.some({
            eventId: event.groupId,
          });
        }).pipe(Effect.withSpan("eventRepositoryImpl.createEventByClub")),
      updateEvent: ({
        eventId,
        name,
        description,
        location,
        locationDescription,
        startAt,
        endAt,
        autoAccept,
        sizeLimit,
      }) =>
        Effect.gen(function* () {
          yield* db
            .update(eventEvent)
            .set({
              ...(description ? { description } : {}),
              ...(location ? { location } : {}),
              ...(locationDescription ? { locationDescription } : {}),
              ...(startAt ? { startAt } : {}),
              ...(endAt ? { endAt } : {}),
              ...(autoAccept ? { autoAccept } : {}),
              ...(sizeLimit ? { sizeLimit } : {}),
            })
            .where(
              and(
                eq(eventEvent.groupId, eventId),
                isNull(eventEvent.deletedAt),
              ),
            );

          if (name) {
            yield* db
              .update(userUserGroup)
              .set({
                name,
              })
              .where(
                and(
                  eq(userUserGroup.publicId, eventId),
                  isNull(userUserGroup.deletedAt),
                ),
              );
          }
        }).pipe(Effect.withSpan("eventRepositoryImpl.updateEvent")),
      deleteEvent: ({ eventId }) =>
        Effect.gen(function* () {
          yield* db
            .update(eventEvent)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventEvent.groupId, eventId),
                isNull(eventEvent.deletedAt),
              ),
            );

          yield* db
            .update(userUserGroup)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(userUserGroup.publicId, eventId),
                isNull(userUserGroup.deletedAt),
              ),
            );

          yield* db
            .update(eventEventMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventEventMember.eventId, eventId),
                isNull(eventEventMember.deletedAt),
              ),
            );

          yield* db
            .update(userUserGroupMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(userUserGroupMember.groupId, eventId),
                isNull(userUserGroupMember.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("eventRepositoryImpl.deleteEvent")),
      getEvent: ({ eventId }) =>
        Effect.gen(function* () {
          const result = yield* db
            .select({
              event: eventEvent,
              group: userUserGroup,
            })
            .from(eventEvent)
            .innerJoin(
              userUserGroup,
              eq(eventEvent.groupId, userUserGroup.publicId),
            )
            .where(
              and(
                eq(eventEvent.groupId, eventId),
                isNull(eventEvent.deletedAt),
                isNull(userUserGroup.deletedAt),
              ),
            );

          if (result.length === 0) {
            return Option.none();
          }

          return Option.some(result[0]);
        }).pipe(Effect.withSpan("eventRepositoryImpl.getEvent")),
      requestEventJoin: ({ eventId, userId, size }) =>
        Effect.gen(function* () {
          const event = yield* db
            .select()
            .from(eventEvent)
            .where(
              and(
                eq(eventEvent.groupId, eventId),
                isNull(eventEvent.deletedAt),
              ),
            );

          if (event.length === 0) return;

          if (event[0].autoAccept || event[0].sizeLimit > 0) {
            const currentTotalSizes = yield* db
              .select({
                size: sum(eventEventMember.size),
              })
              .from(eventEventMember)
              .innerJoin(
                userUserGroupMember,
                and(
                  eq(eventEventMember.eventId, userUserGroupMember.groupId),
                  eq(eventEventMember.userId, userUserGroupMember.userId),
                ),
              )
              .where(
                and(
                  eq(eventEventMember.eventId, eventId),
                  eq(userUserGroupMember.status, "member"),
                  isNull(eventEventMember.deletedAt),
                  isNull(userUserGroupMember.deletedAt),
                ),
              );

            const currentTotalSize =
              currentTotalSizes.length > 0
                ? yield* effectType(
                    type("string.integer.parse"),
                    currentTotalSizes[0].size,
                  )
                : 0;

            if (currentTotalSize + size > event[0].sizeLimit) {
              return;
            }
          }

          yield* db
            .insert(userUserGroupMember)
            .values({
              groupId: eventId,
              userId,
              status: event[0].autoAccept ? "member" : "pending",
            })
            .onConflictDoUpdate({
              target: [userUserGroupMember.groupId, userUserGroupMember.userId],
              set: {
                status: event[0].autoAccept ? "member" : "pending",
              },
              setWhere: and(
                isNull(userUserGroupMember.deletedAt),
                not(eq(userUserGroupMember.status, "member")),
              ),
            });

          yield* db
            .insert(eventEventMember)
            .values({
              eventId,
              userId,
              size,
            })
            .onConflictDoUpdate({
              target: [eventEventMember.eventId, eventEventMember.userId],
              set: {
                size,
              },
              setWhere: and(isNull(eventEventMember.deletedAt)),
            });
        }).pipe(Effect.withSpan("eventRepositoryImpl.requestEventJoin")),
      acceptEventJoin: ({ eventId, userId }) =>
        Effect.gen(function* () {
          const event = yield* db
            .select()
            .from(eventEvent)
            .where(
              and(
                eq(eventEvent.groupId, eventId),
                isNull(eventEvent.deletedAt),
              ),
            );

          if (event.length === 0) return;

          if (event[0].sizeLimit > 0) {
            const currentTotalSizes = yield* db
              .select({
                size: sum(eventEventMember.size),
              })
              .from(eventEventMember)
              .innerJoin(
                userUserGroupMember,
                and(
                  eq(eventEventMember.eventId, userUserGroupMember.groupId),
                  eq(eventEventMember.userId, userUserGroupMember.userId),
                ),
              )
              .where(
                and(
                  eq(eventEventMember.eventId, eventId),
                  eq(userUserGroupMember.status, "member"),
                  isNull(eventEventMember.deletedAt),
                  isNull(userUserGroupMember.deletedAt),
                ),
              );

            const currentTotalSize =
              currentTotalSizes.length > 0
                ? yield* effectType(
                    type("string.integer.parse"),
                    currentTotalSizes[0].size,
                  )
                : 0;

            const pendingUser = yield* db
              .select({
                size: eventEventMember.size,
              })
              .from(eventEventMember)
              .where(
                and(
                  eq(eventEventMember.eventId, eventId),
                  eq(eventEventMember.userId, userId),
                  isNull(eventEventMember.deletedAt),
                ),
              );

            if (pendingUser.length === 0) return;

            if (currentTotalSize + pendingUser[0].size > event[0].sizeLimit) {
              return;
            }
          }

          yield* db
            .update(userUserGroupMember)
            .set({
              status: "member",
            })
            .where(
              and(
                eq(userUserGroupMember.groupId, eventId),
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "pending"),
                isNull(userUserGroupMember.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("eventRepositoryImpl.acceptEventJoin")),
      rejectEventJoin: ({ eventId, userId }) =>
        Effect.gen(function* () {
          yield* db
            .update(userUserGroupMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(userUserGroupMember.groupId, eventId),
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "pending"),
                isNull(userUserGroupMember.deletedAt),
              ),
            );

          yield* db
            .update(eventEventMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventEventMember.eventId, eventId),
                eq(eventEventMember.userId, userId),
                isNull(eventEventMember.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("eventRepositoryImpl.rejectEventJoin")),
      removeMember: ({ eventId, userId }) =>
        Effect.gen(function* () {
          yield* db
            .update(eventEventMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventEventMember.eventId, eventId),
                eq(eventEventMember.userId, userId),
                isNull(eventEventMember.deletedAt),
              ),
            );

          yield* db
            .update(userUserGroupMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(userUserGroupMember.groupId, eventId),
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "member"),
                isNull(userUserGroupMember.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("eventRepositoryImpl.leaveEvent")),
      getEventMembers: ({ eventId }) =>
        Effect.gen(function* () {
          const event = yield* db
            .select()
            .from(eventEvent)
            .where(
              and(
                isNull(eventEvent.deletedAt),
                eq(eventEvent.groupId, eventId),
              ),
            );

          if (event.length === 0) return [];

          const members = yield* db
            .select({
              userId: eventEventMember.userId,
              size: eventEventMember.size,
              status: userUserGroupMember.status,
            })
            .from(eventEventMember)
            .innerJoin(
              userUserGroupMember,
              and(
                eq(eventEventMember.eventId, userUserGroupMember.groupId),
                eq(eventEventMember.userId, userUserGroupMember.userId),
              ),
            )
            .where(
              and(
                eq(eventEventMember.eventId, eventId),
                eq(userUserGroupMember.status, "member"),
                isNull(eventEventMember.deletedAt),
                isNull(userUserGroupMember.deletedAt),
              ),
            );

          return members;
        }).pipe(Effect.withSpan("eventRepositoryImpl.getEventMembers")),
      getEventPendingMembers: ({ eventId }) =>
        Effect.gen(function* () {
          const event = yield* db
            .select()
            .from(eventEvent)
            .where(
              and(
                isNull(eventEvent.deletedAt),
                eq(eventEvent.groupId, eventId),
              ),
            );

          if (event.length === 0) return [];

          const members = yield* db
            .select({
              userId: eventEventMember.userId,
              size: eventEventMember.size,
              status: userUserGroupMember.status,
            })
            .from(eventEventMember)
            .innerJoin(
              userUserGroupMember,
              and(
                eq(eventEventMember.eventId, userUserGroupMember.groupId),
                eq(eventEventMember.userId, userUserGroupMember.userId),
              ),
            )
            .where(
              and(
                eq(eventEventMember.eventId, eventId),
                eq(userUserGroupMember.status, "pending"),
                isNull(eventEventMember.deletedAt),
                isNull(userUserGroupMember.deletedAt),
              ),
            );

          return members;
        }).pipe(Effect.withSpan("eventRepositoryImpl.getEventPendingMembers")),
      getUserCreatedEvents: ({ userId }) =>
        Effect.gen(function* () {
          return yield* db
            .select({
              event: eventEvent,
              group: userUserGroup,
            })
            .from(eventEvent)
            .innerJoin(
              userUserGroup,
              eq(eventEvent.groupId, userUserGroup.publicId),
            )
            .where(
              and(
                eq(eventEvent.eventCreatorType, "user"),
                eq(eventEvent.creatorId, userId),
                isNull(eventEvent.deletedAt),
                isNull(userUserGroup.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("eventRepositoryImpl.getUserCreatedEvents")),
      getUserMemberEvents: ({ userId }) =>
        Effect.gen(function* () {
          const userGroupMember = db.$with("user_event_group").as(
            db
              .select({
                groupId: userUserGroupMember.groupId,
              })
              .from(userUserGroupMember)
              .where(
                and(
                  isNull(userUserGroupMember.deletedAt),
                  eq(userUserGroupMember.userId, userId),
                  eq(userUserGroupMember.status, "member"),
                ),
              ),
          );

          return yield* db
            .with(userGroupMember)
            .select({
              event: eventEvent,
              group: userUserGroup,
            })
            .from(userGroupMember)
            .innerJoin(
              userUserGroup,
              eq(userGroupMember.groupId, userUserGroup.publicId),
            )
            .innerJoin(
              eventEvent,
              eq(userGroupMember.groupId, eventEvent.groupId),
            )
            .where(
              and(
                isNull(userUserGroupMember.deletedAt),
                isNull(eventEvent.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("eventRepositoryImpl.getUserMemberEvents")),
      getUserPendingEvents: ({ userId }) =>
        Effect.gen(function* () {
          const userGroupMember = db.$with("user_event_group").as(
            db
              .select({
                groupId: userUserGroupMember.groupId,
              })
              .from(userUserGroupMember)
              .where(
                and(
                  isNull(userUserGroupMember.deletedAt),
                  eq(userUserGroupMember.userId, userId),
                  eq(userUserGroupMember.status, "pending"),
                ),
              ),
          );

          return yield* db
            .with(userGroupMember)
            .select({
              event: eventEvent,
              group: userUserGroup,
            })
            .from(userGroupMember)
            .innerJoin(
              userUserGroup,
              eq(userGroupMember.groupId, userUserGroup.publicId),
            )
            .innerJoin(
              eventEvent,
              eq(userGroupMember.groupId, eventEvent.groupId),
            )
            .where(
              and(
                isNull(userUserGroupMember.deletedAt),
                isNull(eventEvent.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("eventRepositoryImpl.getUserPendingEvents")),
      getClubEvents: ({ clubId }) =>
        Effect.gen(function* () {
          return yield* db
            .select({
              event: eventEvent,
              group: userUserGroup,
            })
            .from(eventEvent)
            .innerJoin(
              userUserGroup,
              eq(eventEvent.groupId, userUserGroup.publicId),
            )
            .where(
              and(
                eq(eventEvent.eventCreatorType, "club"),
                eq(eventEvent.creatorId, clubId),
                isNull(eventEvent.deletedAt),
                isNull(userUserGroup.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("eventRepositoryImpl.getClubEvents")),
      getEventMemberStatus: ({ eventId, userId }) =>
        Effect.gen(function* () {
          const event = yield* db
            .select()
            .from(eventEvent)
            .where(
              and(
                isNull(eventEvent.deletedAt),
                eq(eventEvent.groupId, eventId),
              ),
            );

          if (event.length === 0) return Option.none();

          const memberStatus = yield* db
            .select({
              status: userUserGroupMember.status,
            })
            .from(userUserGroupMember)
            .where(
              and(
                eq(userUserGroupMember.groupId, eventId),
                eq(userUserGroupMember.userId, userId),
                isNull(userUserGroupMember.deletedAt),
              ),
            );

          if (memberStatus.length === 0) {
            return Option.none();
          }

          return Option.some({ status: memberStatus[0].status });
        }).pipe(Effect.withSpan("eventRepositoryImpl.getEventMemberStatus")),
    });
  }),
);
