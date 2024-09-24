import { Effect, Layer } from "effect";
import { AuthRepository, InvalidSecretError } from "./authRepository";

export const authRepositoryImpl = /*@__PURE__*/ Layer.succeed(AuthRepository, {
  checkSecret: ({ secret }) =>
    Effect.gen(function* () {
      const config = useRuntimeConfig();
      if (secret !== config.upload.secret)
        return yield* Effect.fail(new InvalidSecretError());
    }),
});
