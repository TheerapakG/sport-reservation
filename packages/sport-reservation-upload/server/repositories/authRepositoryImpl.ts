import { Effect, Layer, Redacted } from "effect";
import { RuntimeConfig } from "~/layers";
import { AuthRepository, InvalidSecretError } from "./authRepository";

export const authRepositoryImpl = /*@__PURE__*/ Layer.effect(
  AuthRepository,
  Effect.gen(function* () {
    const config = yield* yield* RuntimeConfig;
    return {
      checkSecret: ({ secret }) =>
        Effect.gen(function* () {
          if (secret !== Redacted.value(config.upload.secret))
            return yield* Effect.fail(new InvalidSecretError());
        }),
    };
  }),
);
