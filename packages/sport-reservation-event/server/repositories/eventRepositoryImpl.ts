import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import {
  eventEvent,
  eventEventSchedule,
  eventEventSkillLevel,
  eventEventSport,
  eventScheduleMember,
  userUserGroup,
  userUserGroupMember,
} from "sport-reservation-db/schema";
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
        autoAccept,
        sizeLimit,
        skillLevel,
        sportType,
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
              autoAccept,
              sizeLimit,
            })
            .returning();

          yield* db.insert(userUserGroupMember).values({
            groupId: group.publicId,
            userId,
            status: "member",
          });

          // Insert skill levels
          if (skillLevel.length > 0) {
            yield* db.insert(eventEventSkillLevel).values(
              skillLevel.map((level) => ({
                eventId: event.groupId,
                skillLevel: level,
              })),
            );
          }

          // Insert sport types
          if (sportType.length > 0) {
            yield* db.insert(eventEventSport).values(
              sportType.map((type) => ({
                eventId: event.groupId,
                sportType: type,
              })),
            );
          }

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
        autoAccept,
        sizeLimit,
        skillLevel,
        sportType,
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
              autoAccept,
              sizeLimit,
            })
            .returning();

          // Insert skill levels
          if (skillLevel.length > 0) {
            yield* db.insert(eventEventSkillLevel).values(
              skillLevel.map((level) => ({
                eventId: event.groupId,
                skillLevel: level,
              })),
            );
          }

          // Insert sport types
          if (sportType.length > 0) {
            yield* db.insert(eventEventSport).values(
              sportType.map((type) => ({
                eventId: event.groupId,
                sportType: type,
              })),
            );
          }

          return Option.some({
            eventId: event.groupId,
          });
        }).pipe(Effect.withSpan("eventRepositoryImpl.createEventByClub")),
      updateEvent: ({
        eventId,
        name,
        image,
        description,
        location,
        locationDescription,
        autoAccept,
        sizeLimit,
      }) =>
        Effect.gen(function* () {
          yield* db
            .update(eventEvent)
            .set({
              ...(image ? { image } : {}),
              ...(description ? { description } : {}),
              ...(location ? { location } : {}),
              ...(locationDescription ? { locationDescription } : {}),
              ...(autoAccept !== undefined ? { autoAccept } : {}),
              ...(sizeLimit !== undefined ? { sizeLimit } : {}),
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
      addEventSkillLevel: ({ eventId, skillLevel }) =>
        Effect.gen(function* () {
          yield* db.insert(eventEventSkillLevel).values(
            skillLevel.map((level) => ({
              eventId,
              skillLevel: level,
            })),
          );
        }).pipe(Effect.withSpan("eventRepositoryImpl.addEventSkillLevel")),
      addEventSportType: ({ eventId, sportType }) =>
        Effect.gen(function* () {
          yield* db.insert(eventEventSport).values(
            sportType.map((type) => ({
              eventId,
              sportType: type,
            })),
          );
        }).pipe(Effect.withSpan("eventRepositoryImpl.addEventSportType")),
      removeEventSkillLevel: ({ eventId, skillLevel }) =>
        Effect.gen(function* () {
          yield* db
            .update(eventEventSkillLevel)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventEventSkillLevel.eventId, eventId),
                inArray(eventEventSkillLevel.skillLevel, skillLevel),
                isNull(eventEventSkillLevel.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("eventRepositoryImpl.removeEventSkillLevel")),
      removeEventSportType: ({ eventId, sportType }) =>
        Effect.gen(function* () {
          yield* db
            .update(eventEventSport)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventEventSport.eventId, eventId),
                inArray(eventEventSport.sportType, sportType),
                isNull(eventEventSport.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("eventRepositoryImpl.removeEventSportType")),
      deleteEvent: ({ eventId }) =>
        Effect.gen(function* () {
          // Get all schedules for this event
          const schedules = yield* db
            .select({
              scheduleId: eventEventSchedule.publicId,
            })
            .from(eventEventSchedule)
            .where(
              and(
                eq(eventEventSchedule.eventId, eventId),
                isNull(eventEventSchedule.deletedAt),
              ),
            );

          const scheduleIds = schedules.map((s) => s.scheduleId);

          // Delete schedule members for all schedules in this event
          if (scheduleIds.length > 0) {
            yield* db
              .update(eventScheduleMember)
              .set({
                deletedAt: sql`now()`,
              })
              .where(
                and(
                  sql`${eventScheduleMember.scheduleId} IN (${scheduleIds.join(",")})`,
                  isNull(eventScheduleMember.deletedAt),
                ),
              );
          }

          // Delete all schedules for this event
          yield* db
            .update(eventEventSchedule)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventEventSchedule.eventId, eventId),
                isNull(eventEventSchedule.deletedAt),
              ),
            );

          // Delete all skill levels for this event
          yield* db
            .update(eventEventSkillLevel)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventEventSkillLevel.eventId, eventId),
                isNull(eventEventSkillLevel.deletedAt),
              ),
            );

          // Delete all sport types for this event
          yield* db
            .update(eventEventSport)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventEventSport.eventId, eventId),
                isNull(eventEventSport.deletedAt),
              ),
            );

          // Delete the event itself
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

          // Delete all user group members
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

          // Delete the user group
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
        }).pipe(Effect.withSpan("eventRepositoryImpl.deleteEvent")),
      getEvent: ({ eventId }) =>
        Effect.gen(function* () {
          const event = yield* db
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

          if (event.length === 0) {
            return Option.none();
          }

          // Get event skill levels
          const skillLevel = yield* db
            .select()
            .from(eventEventSkillLevel)
            .where(
              and(
                eq(eventEventSkillLevel.eventId, eventId),
                isNull(eventEventSkillLevel.deletedAt),
              ),
            );

          // Get event sport types
          const sportType = yield* db
            .select()
            .from(eventEventSport)
            .where(
              and(
                eq(eventEventSport.eventId, eventId),
                isNull(eventEventSport.deletedAt),
              ),
            );

          return Option.some({
            ...event[0],
            skillLevel,
            sportType,
          });
        }).pipe(Effect.withSpan("eventRepositoryImpl.getEvent")),
      getUserCreatedEvents: ({ userId }) =>
        Effect.gen(function* () {
          const events = yield* db
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

          // For each event, get skill levels and sport types
          const eventsWithDetails = yield* Effect.forEach(events, (event) =>
            Effect.gen(function* () {
              const eventId = event.event.groupId;

              // Get event skill levels
              const skillLevel = yield* db
                .select()
                .from(eventEventSkillLevel)
                .where(
                  and(
                    eq(eventEventSkillLevel.eventId, eventId),
                    isNull(eventEventSkillLevel.deletedAt),
                  ),
                );

              // Get event sport types
              const sportType = yield* db
                .select()
                .from(eventEventSport)
                .where(
                  and(
                    eq(eventEventSport.eventId, eventId),
                    isNull(eventEventSport.deletedAt),
                  ),
                );

              return {
                ...event,
                skillLevel,
                sportType,
              };
            }),
          );

          return eventsWithDetails;
        }).pipe(Effect.withSpan("eventRepositoryImpl.getUserCreatedEvents")),
      getClubEvents: ({ clubId }) =>
        Effect.gen(function* () {
          const events = yield* db
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

          // For each event, get skill levels and sport types
          const eventsWithDetails = yield* Effect.forEach(events, (event) =>
            Effect.gen(function* () {
              const eventId = event.event.groupId;

              // Get event skill levels
              const skillLevel = yield* db
                .select()
                .from(eventEventSkillLevel)
                .where(
                  and(
                    eq(eventEventSkillLevel.eventId, eventId),
                    isNull(eventEventSkillLevel.deletedAt),
                  ),
                );

              // Get event sport types
              const sportType = yield* db
                .select()
                .from(eventEventSport)
                .where(
                  and(
                    eq(eventEventSport.eventId, eventId),
                    isNull(eventEventSport.deletedAt),
                  ),
                );

              return {
                ...event,
                skillLevel,
                sportType,
              };
            }),
          );

          return eventsWithDetails;
        }).pipe(Effect.withSpan("eventRepositoryImpl.getClubEvents")),
    });
  }),
);
