import { Effect, pipe, Redacted } from "effect";
import redisDriver from "unstorage/drivers/redis";

export default defineNitroPlugin(async () => {
  await Effect.runPromise(
    pipe(
      Effect.gen(function* () {
        const config = yield* RuntimeConfig;
        useStorage().mount(
          "valkey",
          redisDriver({
            base: "sport-reservation:auth",
            host: yield* config.valkey.host,
            port: yield* config.valkey.port,
            password: Redacted.value(yield* config.valkey.password),
          }),
        );
      }),
      Effect.provide(runtimeConfig),
    ),
  );
});
