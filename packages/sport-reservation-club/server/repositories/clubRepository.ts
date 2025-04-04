import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import {
  clubClub,
  userUserGroup,
  userUserGroupMember,
} from "sport-reservation-db/schema";

export class ClubRepository
  extends /*@__PURE__*/ Context.Tag("ClubRepository")<
    ClubRepository,
    {
      createClub: (data: {
        userId: string;
        name: string;
        description?: string;
        location?: [number, number]; // [longitude, latitude]
        locationDescription?: string;
      }) => Effect.Effect<
        {
          clubId: string;
        },
        SqlError.SqlError
      >;
      updateClub: (data: {
        clubId: string;
        name?: string;
        description?: string;
        location?: [number, number]; // [longitude, latitude]
        locationDescription?: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      deleteClub: (data: {
        clubId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      getClubsByIds: (data: { clubIds: string[] }) => Effect.Effect<
        Option.Option<{
          club: typeof clubClub.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          size: number;
        }>[],
        SqlError.SqlError
      >;
      getClubsByLimit: (data: {
        limit: number;
        offset: number;
      }) => Effect.Effect<
        {
          club: typeof clubClub.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          size: number;
        }[],
        SqlError.SqlError
      >;
      requestClubMembership: (data: {
        clubId: string;
        userId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      acceptClubMembership: (data: {
        clubId: string;
        userId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      rejectClubMembership: (data: {
        clubId: string;
        userId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      removeMember: (data: {
        clubId: string;
        userId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      getClubMembers: (data: {
        clubId: string;
      }) => Effect.Effect<
        (typeof userUserGroupMember.$inferSelect)[],
        SqlError.SqlError
      >;
      getClubPendingMembers: (data: {
        clubId: string;
      }) => Effect.Effect<
        (typeof userUserGroupMember.$inferSelect)[],
        SqlError.SqlError
      >;
      getUserClubs: (data: { userId: string }) => Effect.Effect<
        {
          club: typeof clubClub.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          size: number;
        }[],
        SqlError.SqlError
      >;
      getUserCreatedClubs: (data: { userId: string }) => Effect.Effect<
        {
          club: typeof clubClub.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          size: number;
        }[],
        SqlError.SqlError
      >;
      getUserMemberClubs: (data: { userId: string }) => Effect.Effect<
        {
          club: typeof clubClub.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          size: number;
        }[],
        SqlError.SqlError
      >;
      getUserPendingClubs: (data: { userId: string }) => Effect.Effect<
        {
          club: typeof clubClub.$inferSelect;
          group: typeof userUserGroup.$inferSelect;
          size: number;
        }[],
        SqlError.SqlError
      >;
      getClubMemberStatus: (data: {
        clubId: string;
        userId: string;
      }) => Effect.Effect<{ status: "pending" | "member" }, SqlError.SqlError>;
    }
  >() {}
