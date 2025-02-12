import { Context, Effect } from "effect";

export class InvalidSecretError {
  readonly _tag = "InvalidSecretError";
}

export class AuthRepository
  extends /*@__PURE__*/ Context.Tag("AuthRepository")<
    AuthRepository,
    {
      checkSecret: (data: {
        secret: string;
      }) => Effect.Effect<void, InvalidSecretError>;
    }
  >() {}
