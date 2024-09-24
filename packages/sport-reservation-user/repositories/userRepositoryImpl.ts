import { Effect, Layer, Option } from "effect";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { UserRepository } from "./userRepository";
import { userUserProfile } from "sport-reservation-common/db/schema";
import { eq } from "drizzle-orm";

export const userRepositoryImpl = /*@__PURE__*/ Layer.effect(
  UserRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return {
      createUserProfile: (data) =>
        Effect.gen(function* () {
          const users = yield* db
            .insert(userUserProfile)
            .values(data)
            .returning();
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }),
      updateUserProfile: ({ id, ...data }) =>
        Effect.gen(function* () {
          const users = yield* db
            .update(userUserProfile)
            .set(data)
            .where(eq(userUserProfile.id, id))
            .returning();
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }),
      findUserProfileById: ({ id }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(userUserProfile)
            .where(eq(userUserProfile.id, id))
            .limit(1);
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }),
    };
  }),
);
