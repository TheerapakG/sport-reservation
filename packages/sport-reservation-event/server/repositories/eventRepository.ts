import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import {
  eventEvent,
  userUserGroup,
  userUserGroupMember,
} from "sport-reservation-db/schema";
import { ArktypeError } from "tiara-stack/models/errors";

export class EventRepository
  extends /*@__PURE__*/ Context.Tag("EventRepository")<
    EventRepository,
    {
      createEventByUser: (data: {
        userId: string;
        name: string;
        description?: string;
        location?: [number, number];
        locationDescription?: string;
        startAt: Date;
        endAt: Date;
        autoAccept: boolean;
        sizeLimit: number;
      }) => Effect.Effect<
        {
          eventId: string;
        },
        SqlError.SqlError
      >;
      createEventByClub: (data: {
        clubId: string;
        name: string;
        description?: string;
        location?: [number, number];
        locationDescription?: string;
        startAt: Date;
        endAt: Date;
        autoAccept: boolean;
        sizeLimit: number;
      }) => Effect.Effect<
        Option.Option<{
          eventId: string;
        }>,
        SqlError.SqlError
      >;
      updateEvent: (data: {
        eventId: string;
        name?: string;
        description?: string;
        location?: [number, number];
        locationDescription?: string;
        startAt?: Date;
        endAt?: Date;
        autoAccept?: boolean;
        sizeLimit?: number;
      }) => Effect.Effect<void, SqlError.SqlError>;
      deleteEvent: (data: {
        eventId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      getEvent: (data: { eventId: string }) => Effect.Effect<
        Option.Option<{
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          participants: number;
        }>,
        SqlError.SqlError
      >;
      requestEventJoin: (data: {
        eventId: string;
        userId: string;
        size: number;
      }) => Effect.Effect<void, SqlError.SqlError | ArktypeError>;
      acceptEventJoin: (data: {
        eventId: string;
        userId: string;
      }) => Effect.Effect<void, SqlError.SqlError | ArktypeError>;
      rejectEventJoin: (data: {
        eventId: string;
        userId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      removeMember: (data: {
        eventId: string;
        userId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      getEventMembers: (data: {
        eventId: string;
      }) => Effect.Effect<
        { userId: string; size: number; status: "pending" | "member" }[],
        SqlError.SqlError
      >;
      getEventPendingMembers: (data: {
        eventId: string;
      }) => Effect.Effect<
        { userId: string; size: number; status: "pending" | "member" }[],
        SqlError.SqlError
      >;
      getUserCreatedEvents: (data: { userId: string }) => Effect.Effect<
        {
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          participants: number;
        }[],
        SqlError.SqlError
      >;
      getUserMemberEvents: (data: { userId: string }) => Effect.Effect<
        {
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          participants: number;
        }[],
        SqlError.SqlError
      >;
      getUserPendingEvents: (data: { userId: string }) => Effect.Effect<
        {
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          participants: number;
        }[],
        SqlError.SqlError
      >;
      getClubEvents: (data: { clubId: string }) => Effect.Effect<
        {
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          participants: number;
        }[],
        SqlError.SqlError
      >;
      getEventMemberStatus: (data: {
        eventId: string;
        userId: string;
      }) => Effect.Effect<
        Option.Option<Pick<typeof userUserGroupMember.$inferSelect, "status">>,
        SqlError.SqlError
      >;
      getEventsByDate: (data: {
        date: Date;
        offset: number;
        limit: number;
      }) => Effect.Effect<
        {
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          participants: number;
        }[],
        SqlError.SqlError
      >;
    }
  >() {}
