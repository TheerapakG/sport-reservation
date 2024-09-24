import { FileSystem } from "@effect/platform";
import { Context, Effect, Layer } from "effect";

export class AuthKey
  extends /*@__PURE__*/ Context.Tag("AuthKey")<AuthKey, Buffer>() {}

export const authKey = Layer.effect(
  AuthKey,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    return Buffer.from(yield* fs.readFile("/.secret/auth.key"));
  }),
);
