import { SqlError } from "@effect/sql";
import { Cause, Context, Effect, Option } from "effect";
import {
  matchingCursor,
  matchingCursorMatches,
} from "sport-reservation-db/schema";
import { ArktypeError } from "tiara-stack/models/errors";

export class MatchingDbRepository
  extends /*@__PURE__*/ Context.Tag("MatchingDbRepository")<
    MatchingDbRepository,
    {
      createMatchUserCursor: (data: {
        userId: string;
        minAge?: number;
        maxAge?: number;
        gender?: "male" | "female" | "prefer_not_to_say";
        objectiveCategory: ("casual" | "competitive" | "fitness")[];
      }) => Effect.Effect<
        Option.Option<typeof matchingCursor.$inferSelect>,
        ArktypeError | SqlError.SqlError | Cause.NoSuchElementException
      >;
      getMatchUserCursor: (
        userId: string,
      ) => Effect.Effect<
        Option.Option<typeof matchingCursor.$inferSelect>,
        ArktypeError | SqlError.SqlError | Cause.NoSuchElementException
      >;
      getCursorMatchCount: (
        cursorId: string,
      ) => Effect.Effect<
        number,
        ArktypeError | SqlError.SqlError | Cause.NoSuchElementException
      >;
      getCursorMatches: (
        cursorId: string,
      ) => Effect.Effect<
        (typeof matchingCursorMatches.$inferSelect)[],
        ArktypeError | SqlError.SqlError | Cause.NoSuchElementException
      >;
      matchUser: (
        cursorId: string,
        exactMatchCount: number,
        generalMatchCount: number,
      ) => Effect.Effect<
        {
          userId: string;
          distance: number;
          minDistance: number;
          maxDistance: number;
        }[],
        ArktypeError | SqlError.SqlError | Cause.NoSuchElementException
      >;
    }
  >() {}
