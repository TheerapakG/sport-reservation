import { Effect, Context } from "effect";
import {
  $Fetch,
  ResponseType,
  FetchOptions,
  FetchError as OFetchError,
} from "ofetch";
import { Type } from "arktype";
import { effectType } from "~~/utils/effectType";
import { encodePath } from "ufo";
import { ArktypeError, FetchError } from "~~/models/errors";
import { anyObject } from "./type";

export class Fetch
  extends /*@__PURE__*/ Context.Tag("FetchService")<
    Fetch,
    { fetch: $Fetch }
  >() {}

export type TypedFetchOptions<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  QP extends Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  RP extends Type<unknown, {}>,
  R extends ResponseType = "json",
> = FetchOptions<R> &
  (QP["infer"] extends Record<string, unknown>
    ? {
        query: QP["infer"];
      }
    : { query?: Record<string, unknown> }) &
  (RP["infer"] extends Record<string, unknown>
    ? {
        router: RP["infer"];
      }
    : { router?: Record<string, unknown> });

/*@__NO_SIDE_EFFECTS__*/
export const typedFetch = <
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  T extends Type<unknown, {}> = Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  QP extends Type<unknown, {}> = Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  RP extends Type<unknown, {}> = Type<unknown, {}>,
  R extends ResponseType = "json",
>(
  { response }: { response?: T; queryParams?: QP; routerParams?: RP },
  request: string,
  options?: TypedFetchOptions<QP, RP, R>
): Effect.Effect<T["infer"], ArktypeError | FetchError, Fetch> => {
  return Effect.gen(function* () {
    const { fetch } = yield* Fetch;
    const { router, ...opts } = options ?? {};
    const parsedRequest = request
      .split("/")
      .filter(Boolean)
      .map((s) => {
        if (!s.startsWith("**") && !s.startsWith(":")) return s;
        const replace = router?.[s.replace("**", "").replace(":", "")];
        if (replace === undefined) return s;
        return encodePath(JSON.stringify(replace));
      })
      .join("/");
    return yield* effectType(
      (response ?? anyObject) as T,
      yield* Effect.mapError(
        Effect.tryPromise(() => fetch(parsedRequest, opts)),
        (error) => new FetchError(error.error as OFetchError)
      )
    );
  });
};

/*@__NO_SIDE_EFFECTS__*/
export const withMock = <
  A,
  E,
  R = never,
  Opts extends Record<string, unknown> = Record<string, unknown>,
>(
  fetch: (opts: Opts) => Effect.Effect<A, E, R>
) => {
  return (
    opts: Opts & {
      mock?: Effect.Effect<A, E, never>;
    }
  ) => {
    const { mock } = opts ?? {};
    return mock ?? fetch(opts);
  };
};
