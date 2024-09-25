import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { Config, Effect, Layer, Redacted } from "effect";

export const dbLive = /*@__PURE__*/ Layer.unwrapEffect(
  /*@__PURE__*/ Effect.try(() => {
    const config = useRuntimeConfig();
    const PgLive = PgClient.layer({
      url: Config.succeed(Redacted.make(config.postgresUrl)),
    });
    const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive));
    return Layer.merge(PgLive, DrizzleLive);
  }),
);
