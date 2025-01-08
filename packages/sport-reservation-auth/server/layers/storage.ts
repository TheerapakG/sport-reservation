import { Context, Effect, Layer, Redacted } from "effect";
import { createStorage, Storage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import redisDriver from "unstorage/drivers/redis";
import { RuntimeConfig } from "~/layers/config";

export class StorageService
  extends /*@__PURE__*/ Context.Tag("StorageService")<
    StorageService,
    {
      storage: Storage;
    }
  >() {}

export const storageService = Layer.effect(
  StorageService,
  Effect.gen(function* () {
    const config = yield* yield* RuntimeConfig;
    return {
      storage: createStorage({
        driver: redisDriver({
          base: "sport-reservation:auth",
          url: Redacted.value(config.valkeyUrl),
        }),
      }),
    };
  }),
);

export const mockStorageService = Layer.succeed(StorageService, {
  storage: createStorage({
    driver: memoryDriver(),
  }),
});
