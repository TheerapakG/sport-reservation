import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { Effect, Layer } from "effect";
import { RuntimeConfig } from "./config";

export const dbLive = /*@__PURE__*/ Layer.unwrapEffect(
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* RuntimeConfig;
    const PgLive = PgClient.layer({
      url: config.postgresUrl,
    });
    const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(PgLive));
    return Layer.merge(PgLive, DrizzleLive);
  }),
);
