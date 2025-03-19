import { RuntimeConfig } from "$/layers";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { Config, Effect, Layer } from "effect";

export const dbLive = /*@__PURE__*/ Layer.unwrapEffect(
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* RuntimeConfig;
    const PgLive = PgClient.layer({
      url: yield* Config.map(config, ({ postgresUrl }) => postgresUrl),
      ssl: true,
    });
    const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive));
    return Layer.merge(PgLive, DrizzleLive);
  }),
);
