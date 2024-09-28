import { FileSystem } from "@effect/platform";
import { Context, Effect, Layer, Redacted } from "effect";

export class AuthKey
  extends /*@__PURE__*/ Context.Tag("AuthKey")<AuthKey, Buffer>() {}

export const authKey = Layer.effect(
  AuthKey,
  Effect.gen(function* () {
    const config = yield* RuntimeConfig;
    const fs = yield* FileSystem.FileSystem;

    return Buffer.from(
      yield* fs.readFile(
        Redacted.value(yield* config.secret.path) +
          Redacted.value(yield* config.auth.keyFile),
      ),
    );
  }),
);
