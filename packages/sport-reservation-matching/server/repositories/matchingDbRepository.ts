import { SqlError } from "@effect/sql";
import { Cause, Context, Effect } from "effect";
import { ArktypeError } from "tiara-stack/models/errors";

export class MatchingDbRepository
  extends /*@__PURE__*/ Context.Tag("MatchingDbRepository")<
    MatchingDbRepository,
    {
      matchUser: (
        userId: string,
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
