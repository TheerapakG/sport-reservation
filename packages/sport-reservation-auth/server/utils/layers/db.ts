import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { Config, Effect, Layer, Redacted } from "effect";

export const dbLive = /*@__PURE__*/ Layer.unwrapEffect(
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* RuntimeConfig;
    const PgLive = PgClient.layer({
      url: config.postgresUrl as Config.Config<Redacted.Redacted<string>>,
    });
    const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive));
    return Layer.merge(PgLive, DrizzleLive);
  }),
);
