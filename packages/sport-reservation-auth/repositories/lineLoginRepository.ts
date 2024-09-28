import { Context, Effect, Option } from "effect";
import {
  ArktypeError,
  FetchError,
  ValkeyError,
} from "sport-reservation-common/models/errors";
import { SqlError } from "@effect/sql";
import { lineAuthToken } from "~~/models/line";
import { Simplify } from "effect/Types";
import { ConfigError } from "effect/ConfigError";

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
      findUserIdByLineId: (data: {
        lineId: string;
      }) => Effect.Effect<Option.Option<{ userId: number }>, SqlError.SqlError>;
      associateUserIdWithLineId: (data: {
        userId: number;
        lineId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
    }
  >() {}
