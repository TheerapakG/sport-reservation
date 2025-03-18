import { SqlError } from "@effect/sql";
import { Cause, Context, Effect, Option } from "effect";
import { ArktypeError } from "tiara-stack/models/errors";

export class MatchingDbRepository
  extends /*@__PURE__*/ Context.Tag("MatchingDbRepository")<
    MatchingDbRepository,
    {
      createMatchUserCursor: (
        userId: string,
      ) => Effect.Effect<
        Option.Option<{ cursorId: string }>,
        ArktypeError | SqlError.SqlError | Cause.NoSuchElementException
      >;
      getMatchUserCursor: (
        userId: string,
      ) => Effect.Effect<
        Option.Option<{ cursorId: string }>,
        ArktypeError | SqlError.SqlError | Cause.NoSuchElementException
      >;
      matchUser: (
        cursorId: string,
        limit: number,
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
