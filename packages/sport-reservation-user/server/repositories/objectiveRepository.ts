import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import { Simplify } from "effect/Types";
import { userObjective } from "sport-reservation-db/schema";

export class ObjectiveRepository
  extends /*@__PURE__*/ Context.Tag("ObjectiveRepository")<
    ObjectiveRepository,
    {
      createObjective: (
        data: Simplify<
          Omit<typeof userObjective.$inferInsert, "id" | "publicId">
        >,
      ) => Effect.Effect<
        Option.Option<typeof userObjective.$inferSelect>,
        SqlError.SqlError
      >;
      updateObjective: (
        data: Simplify<
          Omit<typeof userObjective.$inferInsert, "id" | "publicId"> &
            Required<Pick<typeof userObjective.$inferInsert, "publicId">>
        >,
      ) => Effect.Effect<
        Option.Option<typeof userObjective.$inferSelect>,
        SqlError.SqlError
      >;
      findObjectiveById: (data: {
        publicId: string;
      }) => Effect.Effect<
        Option.Option<typeof userObjective.$inferSelect>,
        SqlError.SqlError
      >;
      deleteObjective: (data: {
        publicId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      associateObjectiveWithUser: (data: {
        userId: string;
        objectiveId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      dissociateObjectiveFromUser: (data: {
        userId: string;
        objectiveId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      getObjectivesByUserId: (data: { userId: string }) => Effect.Effect<
        {
          objective: typeof userObjective.$inferSelect;
        }[],
        SqlError.SqlError
      >;
    }
  >() {}
