import { RuntimeConfig } from "$/layers";
import { FileSystem } from "@effect/platform";
import { Context, Effect, Layer, Redacted } from "effect";

export class AuthKey
  extends /*@__PURE__*/ Context.Tag("AuthKey")<AuthKey, { public: Buffer }>() {}

export const authKey = /*@__PURE__*/ Layer.effect(
  AuthKey,
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* yield* RuntimeConfig;
    const fs = yield* FileSystem.FileSystem;

    return {
      public: Buffer.from(
        yield* fs.readFile(
          Redacted.value(config.secret.path) +
            Redacted.value(config.auth.keyFile.public),
        ),
      ),
    };
  }),
);
