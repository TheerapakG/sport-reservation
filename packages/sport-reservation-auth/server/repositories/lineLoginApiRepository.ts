import { Context, Effect } from "effect";
import { ConfigError } from "effect/ConfigError";
import { Simplify } from "effect/Types";
import {
  ArktypeError,
  FetchError,
  ValkeyError,
} from "sport-reservation-common/models/errors";
import { lineAuthToken } from "~/models/line";

export class InvalidLineStateError {
  readonly _tag = "InvalidStateError";
}

export class InvalidLineNonceError {
  readonly _tag = "InvalidLineNonceError";
}

export class LineLoginApiRepository
  extends /*@__PURE__*/ Context.Tag("LineLoginApiRepository")<
    LineLoginApiRepository,
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
        Simplify<{ nonce: string } & typeof lineAuthToken.infer>,
        ConfigError | FetchError | ArktypeError | InvalidLineStateError
      >;
      getProfileByAuthToken: (data: {
        nonce: string;
        idToken: string;
      }) => Effect.Effect<
        { id: string; name: string; avatar: string },
        ConfigError | FetchError | ArktypeError | InvalidLineNonceError
      >;
    }
  >() {}
