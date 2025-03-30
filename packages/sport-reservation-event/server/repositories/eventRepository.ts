import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import { eventEvent, userUserGroup } from "sport-reservation-db/schema";

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
        }>,
        SqlError.SqlError
      >;
      getUserCreatedEvents: (data: { userId: string }) => Effect.Effect<
        {
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
        }[],
        SqlError.SqlError
      >;
      getClubEvents: (data: { clubId: string }) => Effect.Effect<
        {
          event: typeof eventEvent.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
        }[],
        SqlError.SqlError
      >;
    }
  >() {}
