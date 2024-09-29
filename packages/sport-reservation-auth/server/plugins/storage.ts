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
            host: config.valkey.host,
            port: config.valkey.port,
            password: Redacted.value(config.valkey.password),
          }),
        );
      }),
      Effect.provide(runtimeConfig),
    ),
  );
});
