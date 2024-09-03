import { Effect, Context } from "effect";
import { $Fetch, ResponseType, FetchRequest, FetchOptions } from "ofetch";
import { type, Type } from "arktype";
import { findRoute, RouterContext } from "rou3";
import { effectType } from "../effectType";
import { ApiTypes } from "api";
import {
  ExtractedRouteMethod,
  NitroFetchOptions,
  NitroFetchRequest,
  TypedResponse,
} from "api/shared";

export class Router extends Context.Tag("RouterService")<
  Router,
  { router: RouterContext<Type[]> }
>() {}

export class Fetch extends Context.Tag("FetchService")<
  Fetch,
  { fetch: $Fetch }
>() {}

export const typedFetch = <
  T = unknown,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  $ = {},
  R extends ResponseType = "json",
>(
  t: Type<T, $>,
  request: FetchRequest,
  options?: FetchOptions<R>,
) => {
  return Effect.gen(function* () {
    const { fetch } = yield* Fetch;
    return yield* effectType(
      t,
      yield* Effect.tryPromise(() => fetch(request, options)),
    );
  });
};

export const typedNitroFetch = <
  T = unknown,
  P extends keyof ApiTypes = keyof ApiTypes,
  R extends NitroFetchRequest<ApiTypes[P]> = NitroFetchRequest<ApiTypes[P]>,
  O extends NitroFetchOptions<ApiTypes[P], R> = NitroFetchOptions<
    ApiTypes[P],
    R
  >,
>(
  _pkg: P,
  request: R,
  options?: O,
) => {
  return Effect.gen(function* () {
    const { router } = yield* Router;
    const types =
      findRoute(router, (options?.method ?? "get").toLowerCase(), request)
        ?.data ?? [];
    const resolvedType = types.reduceRight((p, c) => type(p, "|", c));
    return (yield* typedFetch(resolvedType, request, options)) as TypedResponse<
      ApiTypes[P],
      R,
      T,
      NitroFetchOptions<ApiTypes[P], R> extends O
        ? "get"
        : ExtractedRouteMethod<ApiTypes[P], R, O>
    >;
  });
};

export const provideTypedNitroFetch = <
  T = unknown,
  P extends keyof ApiTypes = keyof ApiTypes,
  R extends NitroFetchRequest<ApiTypes[P]> = NitroFetchRequest<ApiTypes[P]>,
  O extends NitroFetchOptions<ApiTypes[P], R> = NitroFetchOptions<
    ApiTypes[P],
    R
  >,
  E = never,
>(
  context: Effect.Effect<Context.Context<Fetch | Router>, E>,
  pkg: P,
  request: R,
  options?: O,
) => {
  return Effect.gen(function* () {
    const ctx = yield* context;
    return yield* Effect.provide(
      typedNitroFetch<T, P, R, O>(pkg, request, options),
      ctx,
    );
  });
};

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
