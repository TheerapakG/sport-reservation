import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import {
  and,
  eq,
  gt,
  inArray,
  isNotNull,
  isNull,
  lte,
  not,
  sql,
  sum,
} from "drizzle-orm";
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
import { ScheduleRepository } from "./scheduleRepository";

export const scheduleRepositoryImpl = Layer.effect(
  ScheduleRepository,
  Effect.gen(function* () {
    const db = yield* PgDrizzle;

    const scheduleParticipantsCTE = (
      scheduleIds?: string[],
      repeatIndex?: number,
    ) => {
      const allScheduleRepeats = db.$with("all_schedule_repeats").as(
        db
          .select({
            scheduleId: eventEventSchedule.publicId,
            repeatIndex: sql`generate_series(0, ${eventEventSchedule.repeat}-1)`
              .mapWith(Number)
              .as("repeatIndex"),
          })
          .from(eventEventSchedule)
          .where(and(isNull(eventEventSchedule.deletedAt))),
      );

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
        .with(allScheduleRepeats, allScheduleParticipants)
        .select({
          scheduleId: allScheduleRepeats.scheduleId,
          repeatIndex: allScheduleRepeats.repeatIndex,
          participants:
            sql`coalesce(${allScheduleParticipants.participants}, 0)`
              .mapWith(Number)
              .as("participants"),
        })
        .from(allScheduleRepeats)
        .leftJoin(
          allScheduleParticipants,
          and(
            eq(
              allScheduleRepeats.scheduleId,
              allScheduleParticipants.scheduleId,
            ),
            eq(
              allScheduleRepeats.repeatIndex,
              allScheduleParticipants.repeatIndex,
            ),
          ),
        );

      const wheres = [
        scheduleIds
          ? inArray(allScheduleRepeats.scheduleId, scheduleIds)
          : undefined,
        repeatIndex
          ? eq(allScheduleRepeats.repeatIndex, repeatIndex)
          : undefined,
      ].filter(Boolean);

      return db
        .$with("schedule_participants")
        .as(
          wheres.length > 0
            ? scheduleParticipants.where(and(...wheres))
            : scheduleParticipants,
        );
    };

    const getScheduleRepeatCondition = (date: Date) => {
      const dateEpoch = Math.floor(date.getTime() / 1000);

      return and(
        lte(
          sql`extract(epoch from ${eventEventSchedule.startAt}) + (${eventEventSchedule.repeatInterval} * floor((${dateEpoch} - extract(epoch from ${eventEventSchedule.startAt})) / ${eventEventSchedule.repeatInterval}))`,
          dateEpoch,
        ),
        gt(
          sql`extract(epoch from ${eventEventSchedule.endAt})  + (${eventEventSchedule.repeatInterval} * floor((${dateEpoch} - extract(epoch from ${eventEventSchedule.startAt})) / ${eventEventSchedule.repeatInterval}))`,
          dateEpoch,
        ),
      );
    };

    const getScheduleRepeatIndex = (date: Date) => {
      const dateEpoch = Math.floor(date.getTime() / 1000);

      return sql`floor((${dateEpoch} - extract(epoch from ${eventEventSchedule.startAt})) / ${eventEventSchedule.repeatInterval})`.mapWith(
        Number,
      );
    };

    return ScheduleRepository.of({
      createSchedule: ({ eventId, startAt, endAt, repeat, repeatInterval }) =>
        Effect.gen(function* () {
          const [schedule] = yield* db
            .insert(eventEventSchedule)
            .values({
              eventId,
              startAt,
              endAt,
              repeat,
              repeatInterval,
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
        repeat,
        repeatInterval,
      }) =>
        Effect.gen(function* () {
          yield* db
            .update(eventEventSchedule)
            .set({
              ...(startAt ? { startAt } : {}),
              ...(endAt ? { endAt } : {}),
              ...(repeat !== undefined ? { repeat } : {}),
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
      getSchedule: ({ scheduleId, repeatIndex }) =>
        Effect.gen(function* () {
          const scheduleParticipants = scheduleParticipantsCTE(
            [scheduleId],
            repeatIndex,
          );

          const result = yield* db
            .with(scheduleParticipants)
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
              group: userUserGroup,
              participants: {
                repeatIndex: scheduleParticipants.repeatIndex,
                participants: scheduleParticipants.participants,
              },
            })
            .from(scheduleParticipants)
            .innerJoin(
              eventEventSchedule,
              and(
                eq(
                  scheduleParticipants.scheduleId,
                  eventEventSchedule.publicId,
                ),
                eq(scheduleParticipants.repeatIndex, repeatIndex),
              ),
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

          const eventId = result[0].event.groupId;

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
            ...result[0],
            skillLevel,
            sportType,
          });
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

          // Check if user is the creator of the event
          const creators = yield* db
            .select()
            .from(userUserGroup)
            .where(
              and(
                eq(userUserGroup.publicId, schedule.event.groupId),
                eq(userUserGroup.creatorId, userId),
                isNull(userUserGroup.deletedAt),
              ),
            );

          if (
            creators.length > 0 ||
            (schedule.event.autoAccept && schedule.event.sizeLimit > 0)
          ) {
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
              setWhere: isNotNull(userUserGroupMember.deletedAt),
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
              setWhere: isNotNull(eventScheduleMember.deletedAt),
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

          const schedules = yield* db
            .with(scheduleParticipants)
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
              group: userUserGroup,
              participants: {
                repeatIndex: scheduleParticipants.repeatIndex,
                participants: scheduleParticipants.participants,
              },
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

          // For each schedule, get skill levels and sport types
          const schedulesWithDetails = yield* Effect.forEach(
            schedules,
            (schedule) =>
              Effect.gen(function* () {
                const eventId = schedule.event.groupId;

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
                  ...schedule,
                  skillLevel,
                  sportType,
                };
              }),
          );

          return schedulesWithDetails;
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

          const schedules = yield* db
            .with(scheduleParticipants, userMemberSchedules)
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
              group: userUserGroup,
              participants: {
                repeatIndex: scheduleParticipants.repeatIndex,
                participants: scheduleParticipants.participants,
              },
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

          // For each schedule, get skill levels and sport types
          const schedulesWithDetails = yield* Effect.forEach(
            schedules,
            (schedule) =>
              Effect.gen(function* () {
                const eventId = schedule.event.groupId;

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
                  ...schedule,
                  skillLevel,
                  sportType,
                };
              }),
          );

          return schedulesWithDetails;
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

          const schedules = yield* db
            .with(scheduleParticipants, userPendingSchedules)
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
              group: userUserGroup,
              participants: {
                repeatIndex: scheduleParticipants.repeatIndex,
                participants: scheduleParticipants.participants,
              },
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

          // For each schedule, get skill levels and sport types
          const schedulesWithDetails = yield* Effect.forEach(
            schedules,
            (schedule) =>
              Effect.gen(function* () {
                const eventId = schedule.event.groupId;

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
                  ...schedule,
                  skillLevel,
                  sportType,
                };
              }),
          );

          return schedulesWithDetails;
        }).pipe(
          Effect.withSpan("scheduleRepositoryImpl.getUserPendingSchedules"),
        ),
      getClubSchedules: ({ clubId }) =>
        Effect.gen(function* () {
          const scheduleParticipants = scheduleParticipantsCTE();

          const schedules = yield* db
            .with(scheduleParticipants)
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
              group: userUserGroup,
              participants: {
                repeatIndex: scheduleParticipants.repeatIndex,
                participants: scheduleParticipants.participants,
              },
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

          // For each schedule, get skill levels and sport types
          const schedulesWithDetails = yield* Effect.forEach(
            schedules,
            (schedule) =>
              Effect.gen(function* () {
                const eventId = schedule.event.groupId;

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
                  ...schedule,
                  skillLevel,
                  sportType,
                };
              }),
          );

          return schedulesWithDetails;
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

          const schedules = yield* db
            .with(scheduleParticipants)
            .select({
              schedule: eventEventSchedule,
              event: eventEvent,
              group: userUserGroup,
              participants: {
                repeatIndex: scheduleParticipants.repeatIndex,
                participants: scheduleParticipants.participants,
              },
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
              and(
                eq(
                  eventEventSchedule.publicId,
                  scheduleParticipants.scheduleId,
                ),
                eq(scheduleParticipants.repeatIndex, scheduleRepeatIndex),
              ),
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

          // For each schedule, get skill levels and sport types
          const schedulesWithDetails = yield* Effect.forEach(
            schedules,
            (schedule) =>
              Effect.gen(function* () {
                const eventId = schedule.event.groupId;

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
                  ...schedule,
                  skillLevel,
                  sportType,
                };
              }),
          );

          return schedulesWithDetails;
        }).pipe(Effect.withSpan("scheduleRepositoryImpl.getSchedulesByDate")),
    });
  }),
);
