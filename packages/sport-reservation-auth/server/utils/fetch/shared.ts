import { Effect, Cause, Context } from "effect";
import { $Fetch, ResponseType, FetchRequest, FetchOptions } from "ofetch";
import { Type } from "arktype";
import { ArktypeError } from "~~/models/errors.ts";

export class Fetch
  extends /*@__PURE__*/ Context.Tag("FetchService")<
    Fetch,
    { fetch: $Fetch }
  >() {}

/*@__NO_SIDE_EFFECTS__*/
export const typedFetch = <
  T = unknown,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  $ = {},
  R extends ResponseType = "json",
>(
  t: Type<T, $>,
  request: FetchRequest,
  options?: FetchOptions<R>,
): Effect.Effect<
  Type<T, $>["infer"],
  Cause.UnknownException | ArktypeError,
  Fetch
> => {
  return Effect.gen(function* () {
    const { fetch } = yield* Fetch;
    return yield* effectType(
      t,
      yield* Effect.tryPromise(() => fetch(request, options)),
    );
  });
};

/*@__NO_SIDE_EFFECTS__*/
export const withMock = <Opts extends object, Result, E, R = never>(
  fetch: (opts: Opts) => Effect.Effect<Result, E, R>,
) => {
  return (
    opts: Opts & {
      mock?: Effect.Effect<Result, E, never>;
    },
  ) => {
    const { mock } = opts ?? {};
    return mock ?? fetch(opts);
  };
};
