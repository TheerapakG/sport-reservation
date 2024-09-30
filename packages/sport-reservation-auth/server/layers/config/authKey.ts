import { FileSystem } from "@effect/platform";
import { Context, Effect, Layer, Redacted } from "effect";
import { RuntimeConfig } from "./runtimeConfig";

export class AuthKey
  extends /*@__PURE__*/ Context.Tag("AuthKey")<AuthKey, Buffer>() {}

export const authKey = /*@__PURE__*/ Layer.effect(
  AuthKey,
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* yield* RuntimeConfig;
    const fs = yield* FileSystem.FileSystem;

    return Buffer.from(
      yield* fs.readFile(
        Redacted.value(config.secret.path) +
          Redacted.value(config.auth.keyFile),
      ),
    );
  }),
);
