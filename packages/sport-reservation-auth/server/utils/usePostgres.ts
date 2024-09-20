import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { Effect, Layer } from "effect";

export const dbLive = Effect.cached(
  Effect.try(() => {
    const config = useRuntimeConfig();
    const PgLive = PgClient.layer({
      url: config.postgresUrl,
    });
    const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive));
    return Layer.merge(PgLive, DrizzleLive);
  }),
);
