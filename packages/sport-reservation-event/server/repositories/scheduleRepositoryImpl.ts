import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, gt, inArray, isNull, lte, not, sql, sum } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import {
  eventEvent,
  eventEventSchedule,
  eventScheduleMember,
  userUserGroup,
  userUserGroupMember,
} from "sport-reservation-db/schema";
import { ScheduleRepository } from "./scheduleRepository";

export const scheduleRepositoryImpl = Layer.effect(
  ScheduleRepository,
  Effect.gen(function* () {
    const db = yield* PgDrizzle;

    const scheduleParticipantsCTE = (scheduleIds?: string[]) => {
      const allScheduleParticipants = db.$with("all_schedule_participants").as(
        db
          .select({
            scheduleId: eventScheduleMember.scheduleId,
            repeatIndex: eventScheduleMember.repeatIndex,
            participants: sum(eventScheduleMember.size)
              .mapWith(Number)
              .as("participants"),
          })
          .from(eventScheduleMember)
          .innerJoin(
            eventEventSchedule,
            eq(eventScheduleMember.scheduleId, eventEventSchedule.publicId),
          )
          .innerJoin(
            userUserGroupMember,
            and(
              eq(eventEventSchedule.eventId, userUserGroupMember.groupId),
              eq(eventScheduleMember.userId, userUserGroupMember.userId),
            ),
          )
          .where(
            and(
              eq(userUserGroupMember.status, "member"),
              isNull(eventScheduleMember.deletedAt),
              isNull(userUserGroupMember.deletedAt),
            ),
          )
          .groupBy(
            eventScheduleMember.scheduleId,
            eventScheduleMember.repeatIndex,
          ),
      );

      const scheduleParticipants = db
        .with(allScheduleParticipants)
        .select({
          scheduleId: eventEventSchedule.publicId,
          repeatIndex: allScheduleParticipants.repeatIndex,
          participants:
            sql`coalesce(${allScheduleParticipants.participants}, 0)`
              .mapWith(Number)
              .as("participants"),
        })
        .from(eventEventSchedule)
        .leftJoin(
          allScheduleParticipants,
          eq(eventEventSchedule.publicId, allScheduleParticipants.scheduleId),
        );

      return db
        .$with("schedule_participants")
        .as(
          scheduleIds
            ? scheduleParticipants.where(
                inArray(eventEventSchedule.publicId, scheduleIds),
              )
            : scheduleParticipants,
        );
    };

    const getScheduleRepeatCondition = (date: Date) => {
      return and(
        lte(eventEventSchedule.repeatStartAt, date),
        gt(eventEventSchedule.repeatEndAt, date),
        lte(
          sql`extract(epoch from ${eventEventSchedule.startAt}) - extract(epoch from ${eventEventSchedule.repeatStartAt})`,
          sql`mod(extract(epoch from ${date}) - extract(epoch from ${eventEventSchedule.repeatStartAt}), ${eventEventSchedule.repeatInterval})`,
        ),
        gt(
          sql`extract(epoch from ${eventEventSchedule.endAt}) - extract(epoch from ${eventEventSchedule.repeatStartAt})`,
          sql`mod(extract(epoch from ${date}) - extract(epoch from ${eventEventSchedule.repeatStartAt}), ${eventEventSchedule.repeatInterval})`,
        ),
      );
    };

    const getScheduleRepeatIndex = (date: Date) => {
      return sql`floor((${date} - ${eventEventSchedule.repeatStartAt}) / ${eventEventSchedule.repeatInterval})`.mapWith(
        Number,
      );
    };

    return ScheduleRepository.of({
      createSchedule: ({
        eventId,
        startAt,
        endAt,
        repeatStartAt,
        repeatEndAt,
        repeatInterval,
      }) =>
        Effect.gen(function* () {
          const [schedule] = yield* db
            .insert(eventEventSchedule)
            .values({
              eventId,
              startAt,
              endAt,
              repeatStartAt,
              repeatEndAt,
              repeatInterval: repeatInterval ?? 0,
            })
            .returning();

          return {
            scheduleId: schedule.publicId,
          };
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.createSchedule")),

      updateSchedule: ({
        scheduleId,
        startAt,
        endAt,
        repeatStartAt,
        repeatEndAt,
        repeatInterval,
      }) =>
        Effect.gen(function* () {
          yield* db
            .update(eventEventSchedule)
            .set({
              ...(startAt ? { startAt } : {}),
              ...(endAt ? { endAt } : {}),
              ...(repeatStartAt ? { repeatStartAt } : {}),
              ...(repeatEndAt ? { repeatEndAt } : {}),
              ...(repeatInterval !== undefined ? { repeatInterval } : {}),
            })
            .where(
              and(
                eq(eventEventSchedule.publicId, scheduleId),
                isNull(eventEventSchedule.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.updateSchedule")),

      deleteSchedule: ({ scheduleId }) =>
        Effect.gen(function* () {
          yield* db
            .update(eventEventSchedule)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventEventSchedule.publicId, scheduleId),
                isNull(eventEventSchedule.deletedAt),
              ),
            );

          yield* db
            .update(eventScheduleMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventScheduleMember.scheduleId, scheduleId),
                isNull(eventScheduleMember.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.deleteSchedule")),

      getSchedule: ({ scheduleId }) =>
        Effect.gen(function* () {
          const scheduleParticipants = scheduleParticipantsCTE([scheduleId]);

          const result = yield* db
            .with(scheduleParticipants)
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
              group: userUserGroup,
              participants: scheduleParticipants.participants,
            })
            .from(scheduleParticipants)
            .innerJoin(
              eventEventSchedule,
              eq(scheduleParticipants.scheduleId, eventEventSchedule.publicId),
            )
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .innerJoin(
              userUserGroup,
              eq(eventEvent.groupId, userUserGroup.publicId),
            )
            .where(
              and(
                isNull(eventEventSchedule.deletedAt),
                isNull(eventEvent.deletedAt),
                isNull(userUserGroup.deletedAt),
              ),
            );

          if (result.length === 0) {
            return Option.none();
          }

          return Option.some(result[0]);
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.getSchedule")),
      requestScheduleJoin: ({ scheduleId, repeatIndex, userId, size }) =>
        Effect.gen(function* () {
          const schedules = yield* db
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
            })
            .from(eventEventSchedule)
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .where(
              and(
                eq(eventEventSchedule.publicId, scheduleId),
                isNull(eventEventSchedule.deletedAt),
                isNull(eventEvent.deletedAt),
              ),
            );

          if (schedules.length === 0) return;

          const schedule = schedules[0];

          if (schedule.event.autoAccept && schedule.event.sizeLimit > 0) {
            const currentTotalSizes = yield* db
              .select({
                size: sum(eventScheduleMember.size).mapWith(Number).as("size"),
              })
              .from(eventScheduleMember)
              .innerJoin(
                eventEventSchedule,
                eq(eventScheduleMember.scheduleId, eventEventSchedule.publicId),
              )
              .innerJoin(
                userUserGroupMember,
                and(
                  eq(eventEventSchedule.eventId, userUserGroupMember.groupId),
                  eq(eventScheduleMember.userId, userUserGroupMember.userId),
                ),
              )
              .where(
                and(
                  eq(eventScheduleMember.scheduleId, scheduleId),
                  eq(eventScheduleMember.repeatIndex, repeatIndex),
                  eq(userUserGroupMember.status, "member"),
                  isNull(eventScheduleMember.deletedAt),
                  isNull(userUserGroupMember.deletedAt),
                ),
              );

            const currentTotalSize =
              currentTotalSizes.length > 0 ? currentTotalSizes[0].size : 0;

            if (currentTotalSize + size > schedule.event.sizeLimit) {
              return;
            }
          }

          yield* db
            .insert(userUserGroupMember)
            .values({
              groupId: schedule.event.groupId,
              userId,
              status: schedule.event.autoAccept ? "member" : "pending",
            })
            .onConflictDoUpdate({
              target: [userUserGroupMember.groupId, userUserGroupMember.userId],
              set: {
                status: schedule.event.autoAccept ? "member" : "pending",
                deletedAt: null,
              },
              setWhere: not(eq(userUserGroupMember.status, "member")),
            });

          yield* db
            .insert(eventScheduleMember)
            .values({
              scheduleId,
              repeatIndex,
              userId,
              size,
            })
            .onConflictDoUpdate({
              target: [
                eventScheduleMember.scheduleId,
                eventScheduleMember.repeatIndex,
                eventScheduleMember.userId,
              ],
              set: {
                size,
                deletedAt: null,
              },
            });
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.requestScheduleJoin")),
      acceptScheduleJoin: ({ scheduleId, repeatIndex, userId }) =>
        Effect.gen(function* () {
          const schedules = yield* db
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
            })
            .from(eventEventSchedule)
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .where(
              and(
                eq(eventEventSchedule.publicId, scheduleId),
                isNull(eventEventSchedule.deletedAt),
                isNull(eventEvent.deletedAt),
              ),
            );

          if (schedules.length === 0) return;

          const schedule = schedules[0];

          if (schedule.event.sizeLimit > 0) {
            const currentTotalSizes = yield* db
              .select({
                size: sum(eventScheduleMember.size).mapWith(Number).as("size"),
              })
              .from(eventScheduleMember)
              .innerJoin(
                eventEventSchedule,
                eq(eventScheduleMember.scheduleId, eventEventSchedule.publicId),
              )
              .innerJoin(
                userUserGroupMember,
                and(
                  eq(eventEventSchedule.eventId, userUserGroupMember.groupId),
                  eq(eventScheduleMember.userId, userUserGroupMember.userId),
                ),
              )
              .where(
                and(
                  eq(eventScheduleMember.scheduleId, scheduleId),
                  eq(eventScheduleMember.repeatIndex, repeatIndex),
                  eq(userUserGroupMember.status, "member"),
                  isNull(eventScheduleMember.deletedAt),
                  isNull(userUserGroupMember.deletedAt),
                ),
              );

            const currentTotalSize =
              currentTotalSizes.length > 0 ? currentTotalSizes[0].size : 0;

            const pendingUser = yield* db
              .select({
                size: eventScheduleMember.size,
              })
              .from(eventScheduleMember)
              .where(
                and(
                  eq(eventScheduleMember.scheduleId, scheduleId),
                  eq(eventScheduleMember.repeatIndex, repeatIndex),
                  eq(eventScheduleMember.userId, userId),
                  isNull(eventScheduleMember.deletedAt),
                ),
              );

            if (pendingUser.length === 0) return;

            if (
              currentTotalSize + pendingUser[0].size >
              schedule.event.sizeLimit
            ) {
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
                eq(userUserGroupMember.groupId, schedule.event.groupId),
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "pending"),
                isNull(userUserGroupMember.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.acceptScheduleJoin")),
      rejectScheduleJoin: ({ scheduleId, repeatIndex, userId }) =>
        Effect.gen(function* () {
          const schedule = yield* db
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
            })
            .from(eventEventSchedule)
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .where(
              and(
                eq(eventEventSchedule.publicId, scheduleId),
                isNull(eventEventSchedule.deletedAt),
                isNull(eventEvent.deletedAt),
              ),
            );

          if (schedule.length === 0) return;

          yield* db
            .update(userUserGroupMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(userUserGroupMember.groupId, schedule[0].event.groupId),
                eq(userUserGroupMember.userId, userId),
                eq(userUserGroupMember.status, "pending"),
                isNull(userUserGroupMember.deletedAt),
              ),
            );

          yield* db
            .update(eventScheduleMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventScheduleMember.scheduleId, scheduleId),
                eq(eventScheduleMember.repeatIndex, repeatIndex),
                eq(eventScheduleMember.userId, userId),
                isNull(eventScheduleMember.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.rejectScheduleJoin")),
      removeMember: ({ scheduleId, repeatIndex, userId }) =>
        Effect.gen(function* () {
          const schedule = yield* db
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
            })
            .from(eventEventSchedule)
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .where(
              and(
                eq(eventEventSchedule.publicId, scheduleId),
                isNull(eventEventSchedule.deletedAt),
                isNull(eventEvent.deletedAt),
              ),
            );

          if (schedule.length === 0) return;

          yield* db
            .update(eventScheduleMember)
            .set({
              deletedAt: sql`now()`,
            })
            .where(
              and(
                eq(eventScheduleMember.scheduleId, scheduleId),
                eq(eventScheduleMember.repeatIndex, repeatIndex),
                eq(eventScheduleMember.userId, userId),
                isNull(eventScheduleMember.deletedAt),
              ),
            );

          // Only delete group membership if this is the only schedule they're in
          const otherSchedules = yield* db
            .select()
            .from(eventScheduleMember)
            .where(
              and(
                eq(eventScheduleMember.userId, userId),
                not(eq(eventScheduleMember.scheduleId, scheduleId)),
                isNull(eventScheduleMember.deletedAt),
              ),
            );

          if (otherSchedules.length === 0) {
            yield* db
              .update(userUserGroupMember)
              .set({
                deletedAt: sql`now()`,
              })
              .where(
                and(
                  eq(userUserGroupMember.groupId, schedule[0].event.groupId),
                  eq(userUserGroupMember.userId, userId),
                  eq(userUserGroupMember.status, "member"),
                  isNull(userUserGroupMember.deletedAt),
                ),
              );
          }
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.removeMember")),
      getScheduleMembers: ({ scheduleId, repeatIndex }) =>
        Effect.gen(function* () {
          const schedules = yield* db
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
            })
            .from(eventEventSchedule)
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .where(
              and(
                isNull(eventEventSchedule.deletedAt),
                eq(eventEventSchedule.publicId, scheduleId),
              ),
            );

          if (schedules.length === 0) return [];

          const members = yield* db
            .select({
              userId: eventScheduleMember.userId,
              size: eventScheduleMember.size,
              status: userUserGroupMember.status,
            })
            .from(eventScheduleMember)
            .innerJoin(
              eventEventSchedule,
              eq(eventScheduleMember.scheduleId, eventEventSchedule.publicId),
            )
            .innerJoin(
              userUserGroupMember,
              and(
                eq(eventEventSchedule.eventId, userUserGroupMember.groupId),
                eq(eventScheduleMember.userId, userUserGroupMember.userId),
              ),
            )
            .where(
              and(
                eq(eventScheduleMember.scheduleId, scheduleId),
                eq(eventScheduleMember.repeatIndex, repeatIndex),
                eq(userUserGroupMember.status, "member"),
                isNull(eventScheduleMember.deletedAt),
                isNull(userUserGroupMember.deletedAt),
              ),
            );

          return members;
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.getScheduleMembers")),
      getSchedulePendingMembers: ({ scheduleId, repeatIndex }) =>
        Effect.gen(function* () {
          const schedules = yield* db
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
            })
            .from(eventEventSchedule)
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .where(
              and(
                isNull(eventEventSchedule.deletedAt),
                eq(eventEventSchedule.publicId, scheduleId),
              ),
            );

          if (schedules.length === 0) return [];

          const members = yield* db
            .select({
              userId: eventScheduleMember.userId,
              size: eventScheduleMember.size,
              status: userUserGroupMember.status,
            })
            .from(eventScheduleMember)
            .innerJoin(
              eventEventSchedule,
              eq(eventScheduleMember.scheduleId, eventEventSchedule.publicId),
            )
            .innerJoin(
              userUserGroupMember,
              and(
                eq(eventEventSchedule.eventId, userUserGroupMember.groupId),
                eq(eventScheduleMember.userId, userUserGroupMember.userId),
              ),
            )
            .where(
              and(
                eq(eventScheduleMember.scheduleId, scheduleId),
                eq(eventScheduleMember.repeatIndex, repeatIndex),
                eq(userUserGroupMember.status, "pending"),
                isNull(eventScheduleMember.deletedAt),
                isNull(userUserGroupMember.deletedAt),
              ),
            );

          return members;
        }).pipe(
          Effect.withSpan("scheduleRepositoryImpl.getSchedulePendingMembers"),
        ),
      getUserCreatedSchedules: ({ userId }) =>
        Effect.gen(function* () {
          const scheduleParticipants = scheduleParticipantsCTE();

          return yield* db
            .with(scheduleParticipants)
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
              group: userUserGroup,
              participants: scheduleParticipants.participants,
            })
            .from(eventEventSchedule)
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .innerJoin(
              userUserGroup,
              eq(eventEvent.groupId, userUserGroup.publicId),
            )
            .leftJoin(
              scheduleParticipants,
              eq(eventEventSchedule.publicId, scheduleParticipants.scheduleId),
            )
            .where(
              and(
                eq(eventEvent.eventCreatorType, "user"),
                eq(eventEvent.creatorId, userId),
                isNull(eventEventSchedule.deletedAt),
                isNull(eventEvent.deletedAt),
                isNull(userUserGroup.deletedAt),
              ),
            );
        }).pipe(
          Effect.withSpan("scheduleRepositoryImpl.getUserCreatedSchedules"),
        ),
      getUserMemberSchedules: ({ userId }) =>
        Effect.gen(function* () {
          const scheduleParticipants = scheduleParticipantsCTE();

          const userMemberSchedules = db.$with("user_member_schedules").as(
            db
              .select({
                scheduleId: eventScheduleMember.scheduleId,
                repeatIndex: eventScheduleMember.repeatIndex,
              })
              .from(eventScheduleMember)
              .innerJoin(
                eventEventSchedule,
                eq(eventScheduleMember.scheduleId, eventEventSchedule.publicId),
              )
              .innerJoin(
                userUserGroupMember,
                and(
                  eq(eventEventSchedule.eventId, userUserGroupMember.groupId),
                  eq(eventScheduleMember.userId, userUserGroupMember.userId),
                ),
              )
              .where(
                and(
                  eq(eventScheduleMember.userId, userId),
                  eq(userUserGroupMember.status, "member"),
                  isNull(eventScheduleMember.deletedAt),
                  isNull(userUserGroupMember.deletedAt),
                ),
              ),
          );

          return yield* db
            .with(scheduleParticipants, userMemberSchedules)
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
              group: userUserGroup,
              participants: scheduleParticipants.participants,
            })
            .from(userMemberSchedules)
            .innerJoin(
              eventEventSchedule,
              eq(userMemberSchedules.scheduleId, eventEventSchedule.publicId),
            )
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .innerJoin(
              userUserGroup,
              eq(eventEvent.groupId, userUserGroup.publicId),
            )
            .leftJoin(
              scheduleParticipants,
              and(
                eq(
                  eventEventSchedule.publicId,
                  scheduleParticipants.scheduleId,
                ),
                eq(
                  userMemberSchedules.repeatIndex,
                  scheduleParticipants.repeatIndex,
                ),
              ),
            )
            .where(
              and(
                isNull(eventEventSchedule.deletedAt),
                isNull(eventEvent.deletedAt),
                isNull(userUserGroup.deletedAt),
              ),
            );
        }).pipe(
          Effect.withSpan("scheduleRepositoryImpl.getUserMemberSchedules"),
        ),
      getUserPendingSchedules: ({ userId }) =>
        Effect.gen(function* () {
          const scheduleParticipants = scheduleParticipantsCTE();

          const userPendingSchedules = db.$with("user_pending_schedules").as(
            db
              .select({
                scheduleId: eventScheduleMember.scheduleId,
                repeatIndex: eventScheduleMember.repeatIndex,
              })
              .from(eventScheduleMember)
              .innerJoin(
                eventEventSchedule,
                eq(eventScheduleMember.scheduleId, eventEventSchedule.publicId),
              )
              .innerJoin(
                userUserGroupMember,
                and(
                  eq(eventEventSchedule.eventId, userUserGroupMember.groupId),
                  eq(eventScheduleMember.userId, userUserGroupMember.userId),
                ),
              )
              .where(
                and(
                  eq(eventScheduleMember.userId, userId),
                  eq(userUserGroupMember.status, "pending"),
                  isNull(eventScheduleMember.deletedAt),
                  isNull(userUserGroupMember.deletedAt),
                ),
              ),
          );

          return yield* db
            .with(scheduleParticipants, userPendingSchedules)
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
              group: userUserGroup,
              participants: scheduleParticipants.participants,
            })
            .from(userPendingSchedules)
            .innerJoin(
              eventEventSchedule,
              eq(userPendingSchedules.scheduleId, eventEventSchedule.publicId),
            )
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .innerJoin(
              userUserGroup,
              eq(eventEvent.groupId, userUserGroup.publicId),
            )
            .leftJoin(
              scheduleParticipants,
              and(
                eq(
                  eventEventSchedule.publicId,
                  scheduleParticipants.scheduleId,
                ),
                eq(
                  userPendingSchedules.repeatIndex,
                  scheduleParticipants.repeatIndex,
                ),
              ),
            )
            .where(
              and(
                isNull(eventEventSchedule.deletedAt),
                isNull(eventEvent.deletedAt),
                isNull(userUserGroup.deletedAt),
              ),
            );
        }).pipe(
          Effect.withSpan("scheduleRepositoryImpl.getUserPendingSchedules"),
        ),
      getClubSchedules: ({ clubId }) =>
        Effect.gen(function* () {
          const scheduleParticipants = scheduleParticipantsCTE();

          return yield* db
            .with(scheduleParticipants)
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
              group: userUserGroup,
              participants: scheduleParticipants.participants,
            })
            .from(eventEventSchedule)
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .innerJoin(
              userUserGroup,
              eq(eventEvent.groupId, userUserGroup.publicId),
            )
            .leftJoin(
              scheduleParticipants,
              eq(eventEventSchedule.publicId, scheduleParticipants.scheduleId),
            )
            .where(
              and(
                eq(eventEvent.eventCreatorType, "club"),
                eq(eventEvent.creatorId, clubId),
                isNull(eventEventSchedule.deletedAt),
                isNull(eventEvent.deletedAt),
                isNull(userUserGroup.deletedAt),
              ),
            );
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.getClubSchedules")),

      getScheduleMemberStatus: ({ scheduleId, userId }) =>
        Effect.gen(function* () {
          const schedules = yield* db
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
            })
            .from(eventEventSchedule)
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .where(
              and(
                isNull(eventEventSchedule.deletedAt),
                eq(eventEventSchedule.publicId, scheduleId),
              ),
            );

          if (schedules.length === 0) return Option.none();

          const schedule = schedules[0];

          const memberStatus = yield* db
            .select({
              status: userUserGroupMember.status,
            })
            .from(userUserGroupMember)
            .where(
              and(
                eq(userUserGroupMember.groupId, schedule.event.groupId),
                eq(userUserGroupMember.userId, userId),
                isNull(userUserGroupMember.deletedAt),
              ),
            );

          if (memberStatus.length === 0) {
            return Option.none();
          }

          return Option.some({ status: memberStatus[0].status });
        }).pipe(
          Effect.withSpan("scheduleRepositoryImpl.getScheduleMemberStatus"),
        ),
      getSchedulesByDate: ({ date, offset, limit }) =>
        Effect.gen(function* () {
          const scheduleParticipants = scheduleParticipantsCTE();

          const scheduleRepeatIndex = getScheduleRepeatIndex(date);

          return yield* db
            .with(scheduleParticipants)
            .select({
              schedule: eventEventSchedule,
              repeatIndex: scheduleRepeatIndex,
              event: eventEvent,
              group: userUserGroup,
              participants: scheduleParticipants.participants,
            })
            .from(eventEventSchedule)
            .innerJoin(
              eventEvent,
              eq(eventEventSchedule.eventId, eventEvent.groupId),
            )
            .innerJoin(
              userUserGroup,
              eq(eventEvent.groupId, userUserGroup.publicId),
            )
            .leftJoin(
              scheduleParticipants,
              eq(eventEventSchedule.publicId, scheduleParticipants.scheduleId),
            )
            .where(
              and(
                getScheduleRepeatCondition(date),
                isNull(eventEventSchedule.deletedAt),
                isNull(eventEvent.deletedAt),
                isNull(userUserGroup.deletedAt),
              ),
            )
            .offset(offset)
            .limit(limit);
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.getSchedulesByDate")),
    });
  }),
);
