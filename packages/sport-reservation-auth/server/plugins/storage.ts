import { Effect, pipe, Redacted } from "effect";
import redisDriver from "unstorage/drivers/redis";
import { runtimeConfig, RuntimeConfig } from "~/layers";

export default defineNitroPlugin(async () => {
  await Effect.runPromise(
    pipe(
      Effect.gen(function* () {
        const config = yield* yield* RuntimeConfig;
        useStorage().mount(
          "valkey",
          redisDriver({
            base: "sport-reservation:auth",
            url: Redacted.value(config.valkeyUrl),
          }),
        );
      }),
      Effect.provide(runtimeConfig),
    ),
  );
});
