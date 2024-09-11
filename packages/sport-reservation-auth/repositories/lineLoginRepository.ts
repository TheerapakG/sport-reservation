import { Context, Effect } from "effect";
import { ArktypeError, FetchError, ValkeyError } from "~~/models/errors";
import { lineAuthToken, lineRequest } from "~~/models/line";

export class InvalidLineStateError {
  readonly _tag = "InvalidStateError";
}

export class InvalidLineNonceError {
  readonly _tag = "InvalidLineNonceError";
}

export class LineLoginRepository
  extends /*@__PURE__*/ Context.Tag("LineLoginRepository")<
    LineLoginRepository,
    {
      generateRequest: () => Effect.Effect<
        typeof lineRequest.infer,
        FetchError | ValkeyError
      >;
      getAuthToken: (data: {
        code: string;
        state: string;
      }) => Effect.Effect<
        typeof lineAuthToken.infer,
        FetchError | ArktypeError | InvalidLineStateError
      >;
      getProfileByAuthToken: (
        data: typeof lineAuthToken.infer,
      ) => Effect.Effect<unknown, ArktypeError | InvalidLineNonceError>;
      findUserByProfile: (
        data: typeof lineAuthToken.infer,
      ) => Effect.Effect<unknown>;
      createUserByProfile: (
        data: typeof lineAuthToken.infer,
      ) => Effect.Effect<unknown>;
    }
  >() {}
