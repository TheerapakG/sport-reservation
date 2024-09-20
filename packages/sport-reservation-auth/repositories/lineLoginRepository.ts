import { Context, Effect } from "effect";
import { ArktypeError, FetchError, ValkeyError } from "~~/models/errors";
import { lineAuthToken } from "~~/models/line";

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
        {
          state: string;
          nonce: string;
          codeVerifier: string;
          scope: string;
        },
        FetchError | ValkeyError
      >;
      getAuthToken: (data: {
        code: string;
        state: string;
      }) => Effect.Effect<
        typeof lineAuthToken.infer,
        FetchError | ArktypeError | InvalidLineStateError
      >;
      getProfileByAuthToken: (data: {
        nonce: string;
        idToken: string;
      }) => Effect.Effect<
        { id: string; name: string; avatar: string },
        FetchError | ArktypeError | InvalidLineNonceError
      >;
      findUserByProfile: (data: { id: string }) => Effect.Effect<unknown>;
      createUserByProfile: (data: {
        id: string;
        name: string;
        avatar: string;
      }) => Effect.Effect<unknown>;
    }
  >() {}
