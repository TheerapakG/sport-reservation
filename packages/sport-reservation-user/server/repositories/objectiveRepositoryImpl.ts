import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import {
  userObjective,
  userUserProfileObjective,
} from "sport-reservation-db/schema";
import { ObjectiveRepository } from "./objectiveRepository";

export const objectiveRepositoryImpl = /*@__PURE__*/ Layer.effect(
  ObjectiveRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return ObjectiveRepository.of({
      createObjective: (data) =>
        Effect.gen(function* () {
          const users = yield* db
            .insert(userObjective)
            .values(data)
            .onConflictDoNothing()
            .returning();
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }).pipe(Effect.withSpan("objectiveRepositoryImpl.createObjective")),
      updateObjective: ({ publicId, ...data }) =>
        Effect.gen(function* () {
          const users = yield* db
            .update(userObjective)
            .set(data)
            .where(
              and(
                isNull(userObjective.deletedAt),
                eq(userObjective.publicId, publicId),
              ),
            )
            .returning();
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }).pipe(Effect.withSpan("objectiveRepositoryImpl.updateObjective")),
      findObjectiveById: ({ publicId }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(userObjective)
            .where(
              and(
                isNull(userObjective.deletedAt),
                eq(userObjective.publicId, publicId),
              ),
            )
            .limit(1);
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }).pipe(Effect.withSpan("objectiveRepositoryImpl.findObjectiveById")),
      deleteObjective: ({ publicId }) =>
        Effect.gen(function* () {
          yield* db
            .update(userObjective)
            .set({ deletedAt: new Date() })
            .where(eq(userObjective.publicId, publicId));
        }).pipe(Effect.withSpan("objectiveRepositoryImpl.deleteObjective")),
      associateObjectiveWithUser: ({ userId, objectiveId }) =>
        Effect.gen(function* () {
          yield* db
            .insert(userUserProfileObjective)
            .values({ userId, objectiveId });
        }).pipe(
          Effect.withSpan("objectiveRepositoryImpl.associateObjectiveWithUser"),
        ),
      dissociateObjectiveFromUser: ({ userId, objectiveId }) =>
        Effect.gen(function* () {
          yield* db
            .update(userUserProfileObjective)
            .set({ deletedAt: new Date() })
            .where(
              and(
                eq(userUserProfileObjective.userId, userId),
                eq(userUserProfileObjective.objectiveId, objectiveId),
              ),
            );
        }).pipe(
          Effect.withSpan(
            "objectiveRepositoryImpl.dissociateObjectiveFromUser",
          ),
        ),
      getObjectivesByUserId: ({ userId }) =>
        Effect.gen(function* () {
          const objectives = yield* db
            .select({
              objective: userObjective,
            })
            .from(userUserProfileObjective)
            .innerJoin(
              userObjective,
              eq(userUserProfileObjective.objectiveId, userObjective.publicId),
            )
            .where(
              and(
                isNull(userUserProfileObjective.deletedAt),
                eq(userUserProfileObjective.userId, userId),
              ),
            );
          return objectives;
        }).pipe(
          Effect.withSpan("objectiveRepositoryImpl.getObjectivesByUserId"),
        ),
    });
  }),
);
