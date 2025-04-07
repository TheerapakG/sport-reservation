import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import {
  eventEvent,
  eventEventSchedule,
  eventEventSkillLevel,
  eventEventSport,
  userUserGroup,
  userUserGroupMember,
} from "sport-reservation-db/schema";
import { ArktypeError } from "tiara-stack/models/errors";

export class ScheduleRepository
  extends /*@__PURE__*/ Context.Tag("ScheduleRepository")<
    ScheduleRepository,
    {
      createSchedule: (data: {
        eventId: string;
        startAt: Date;
        endAt: Date;
        repeat: number;
        repeatInterval: number;
      }) => Effect.Effect<
        {
          scheduleId: string;
        },
        SqlError.SqlError
      >;
      updateSchedule: (data: {
        scheduleId: string;
        startAt?: Date;
        endAt?: Date;
        repeat?: number;
        repeatInterval?: number;
      }) => Effect.Effect<void, SqlError.SqlError>;
      deleteSchedule: (data: {
        scheduleId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      getSchedule: (data: {
        scheduleId: string;
        repeatIndex: number;
      }) => Effect.Effect<
        Option.Option<{
          schedule: typeof eventEventSchedule.$inferSelect;
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          skillLevel: (typeof eventEventSkillLevel.$inferSelect)[];
          sportType: (typeof eventEventSport.$inferSelect)[];
          participants: {
            repeatIndex: number;
            participants: number;
          };
        }>,
        SqlError.SqlError
      >;
      requestScheduleJoin: (data: {
        scheduleId: string;
        repeatIndex: number;
        userId: string;
        size: number;
      }) => Effect.Effect<void, SqlError.SqlError | ArktypeError>;
      acceptScheduleJoin: (data: {
        scheduleId: string;
        repeatIndex: number;
        userId: string;
      }) => Effect.Effect<void, SqlError.SqlError | ArktypeError>;
      rejectScheduleJoin: (data: {
        scheduleId: string;
        repeatIndex: number;
        userId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      removeMember: (data: {
        scheduleId: string;
        repeatIndex: number;
        userId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      getScheduleMembers: (data: {
        scheduleId: string;
        repeatIndex: number;
      }) => Effect.Effect<
        { userId: string; size: number; status: "pending" | "member" }[],
        SqlError.SqlError
      >;
      getSchedulePendingMembers: (data: {
        scheduleId: string;
        repeatIndex: number;
      }) => Effect.Effect<
        { userId: string; size: number; status: "pending" | "member" }[],
        SqlError.SqlError
      >;
      getUserCreatedSchedules: (data: { userId: string }) => Effect.Effect<
        {
          schedule: typeof eventEventSchedule.$inferSelect;
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          skillLevel: (typeof eventEventSkillLevel.$inferSelect)[];
          sportType: (typeof eventEventSport.$inferSelect)[];
          participants: {
            repeatIndex: number;
            participants: number;
          };
        }[],
        SqlError.SqlError
      >;
      getUserMemberSchedules: (data: { userId: string }) => Effect.Effect<
        {
          schedule: typeof eventEventSchedule.$inferSelect;
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          skillLevel: (typeof eventEventSkillLevel.$inferSelect)[];
          sportType: (typeof eventEventSport.$inferSelect)[];
          participants: {
            repeatIndex: number;
            participants: number;
          };
        }[],
        SqlError.SqlError
      >;
      getUserMemberSchedulesCount: (data: {
        userId: string;
      }) => Effect.Effect<number, SqlError.SqlError>;
      getUserPendingSchedules: (data: { userId: string }) => Effect.Effect<
        {
          schedule: typeof eventEventSchedule.$inferSelect;
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          skillLevel: (typeof eventEventSkillLevel.$inferSelect)[];
          sportType: (typeof eventEventSport.$inferSelect)[];
          participants: {
            repeatIndex: number;
            participants: number;
          };
        }[],
        SqlError.SqlError
      >;
      getClubSchedules: (data: { clubId: string }) => Effect.Effect<
        {
          schedule: typeof eventEventSchedule.$inferSelect;
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          skillLevel: (typeof eventEventSkillLevel.$inferSelect)[];
          sportType: (typeof eventEventSport.$inferSelect)[];
          participants: {
            repeatIndex: number;
            participants: number;
          };
        }[],
        SqlError.SqlError
      >;
      getScheduleMemberStatus: (data: {
        scheduleId: string;
        userId: string;
      }) => Effect.Effect<
        Option.Option<Pick<typeof userUserGroupMember.$inferSelect, "status">>,
        SqlError.SqlError
      >;
      getSchedulesByDate: (data: {
        date: Date;
        offset: number;
        limit: number;
      }) => Effect.Effect<
        {
          schedule: typeof eventEventSchedule.$inferSelect;
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          skillLevel: (typeof eventEventSkillLevel.$inferSelect)[];
          sportType: (typeof eventEventSport.$inferSelect)[];
          participants: {
            repeatIndex: number;
            participants: number;
          };
        }[],
        SqlError.SqlError
      >;
    }
  >() {}
