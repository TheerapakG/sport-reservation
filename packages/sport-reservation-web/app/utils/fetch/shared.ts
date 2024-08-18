import { Effect, Context, Cause } from "effect";
import { $Fetch, ResponseType, FetchRequest, FetchOptions } from "ofetch";
import { z } from "zod";

export class Fetch extends Context.Tag("FetchService")<
  Fetch,
  { fetch: Effect.Effect<$Fetch> }
>() {}

export const typedFetch = <
  T extends z.ZodTypeAny,
  R extends ResponseType = "json",
>(
  type: T,
  request: FetchRequest,
  options?: FetchOptions<R>,
) => {
  return Fetch.pipe(
    Effect.andThen((fetch) => fetch.fetch),
    Effect.andThen((fetch) => Effect.tryPromise(() => fetch(request, options))),
    Effect.andThen((result) =>
      Effect.tryPromise(() => type.parseAsync(result) as Promise<z.infer<T>>),
    ),
  );
};

export const withMock = <Opts extends object, Result>(
  fetch: (opts?: Opts) => Effect.Effect<Result, Cause.UnknownException, never>,
) => {
  return (
    opts?: Opts & {
      mock?: Effect.Effect<Result, Cause.UnknownException, never>;
    },
  ) => {
    const { mock } = opts ?? {};
    return mock ?? fetch(opts);
  };
};
