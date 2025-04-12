import { type } from "arktype";
import { Console, Context, Effect, pipe } from "effect";
import { Simplify } from "effect/Types";
import {
  $Fetch,
  FetchOptions,
  FetchResponse,
  MappedResponseType,
  FetchError as OFetchError,
  ResponseType,
} from "ofetch";
import { encodePath } from "ufo";
import {
  FetchBodyValidatorType,
  FetchQueryValidatorType,
  FetchRouterValidatorType,
  FetchTypeConfig,
} from "~~/src/config";
import { ArktypeError, FetchError } from "~~/src/models/errors";
import { effectType } from "~~/src/utils/effectType";
import { anyObjectType } from "./type";

export class Fetch
  extends /*@__PURE__*/ Context.Tag("FetchService")<
    Fetch,
    { fetch: $Fetch }
  >() {}

export type TypedFetchParamsOptions<
  C extends FetchTypeConfig = FetchTypeConfig,
> = Simplify<
  ([FetchQueryValidatorType<C>] extends [type.Any]
    ? FetchQueryValidatorType<C>["inferIn"] extends Record<string, unknown>
      ? {
          query: FetchQueryValidatorType<C>["inferIn"];
        }
      : { query?: never }
    : { query?: never }) &
    ([FetchBodyValidatorType<C>] extends [type.Any]
      ? FetchBodyValidatorType<C>["inferIn"] extends unknown
        ? {
            body:
              | NonNullable<RequestInit["body"]>
              | FetchBodyValidatorType<C>["inferIn"];
          }
        : { body?: never }
      : { body?: never }) &
    ([FetchRouterValidatorType<C>] extends [type.Any]
      ? FetchRouterValidatorType<C>["inferIn"] extends Record<string, unknown>
        ? { router: FetchRouterValidatorType<C>["inferIn"] }
        : { router?: never }
      : { router?: never })
>;

export type TypedFetchOptions<
  C extends FetchTypeConfig = FetchTypeConfig,
  R extends ResponseType = "json",
> = Omit<FetchOptions<R>, "query" | "body" | "router"> &
  TypedFetchParamsOptions<C>;

/*@__NO_SIDE_EFFECTS__*/
export const typedFetch = <
  C extends FetchTypeConfig = FetchTypeConfig,
  R extends ResponseType = "json",
>(
  {
    response: responseType,
    query: queryType,
    body: bodyType,
    router: routerType,
  }: C,
  request: string,
  options?: TypedFetchOptions<C, R>,
): Effect.Effect<
  MappedResponseType<R, C["response"]["type"]["out"]["infer"]>,
  ArktypeError | FetchError,
  Fetch
> =>
  Effect.gen(function* () {
    const { fetch } = yield* Fetch;
    const { query, body, router, ...opts } = {
      query: undefined,
      body: undefined,
      router: undefined,
      ...options,
    };
    const parsedQuery = queryType?.config.decode
      ? Object.fromEntries(
          Object.entries(query ?? {}).map(([key, value]) => [
            key,
            JSON.stringify(value),
          ]),
        )
      : query;
    const parsedBody = bodyType?.config.decode
      ? Object.fromEntries(
          Object.entries(body ?? {}).map(([key, value]) => [
            key,
            JSON.stringify(value),
          ]),
        )
      : body;
    const parsedRequest = request
      .split("/")
      .filter(Boolean)
      .map((s) => {
        if (!s.startsWith("**") && !s.startsWith(":")) return s;
        const replace = router?.[s.replace("**", "").replace(":", "")];
        if (replace === undefined) return s;
        return routerType?.config.decode
          ? encodePath(JSON.stringify(replace))
          : replace;
      })
      .join("/");

    const fetchResponse = yield* pipe(
      Effect.tryPromise(() =>
        fetch(parsedRequest, {
          ...opts,
          ...(parsedQuery ? { query: parsedQuery } : {}),
          ...(parsedBody ? { body: parsedBody } : {}),
        }),
      ),
      Effect.mapError((error) => new FetchError(error.error as OFetchError)),
      Effect.tapError((error) => Console.log("[ERROR]", error)),
    );

    if (
      ["blob", "text", "arrayBuffer", "stream"].includes(
        (opts as FetchOptions<R>)?.responseType ?? "json",
      )
    )
      return fetchResponse as MappedResponseType<
        R,
        C["response"]["type"]["out"]["infer"]
      >;
    return (yield* effectType(
      (responseType.type?.out ?? anyObjectType) as C["response"]["type"]["out"],
      fetchResponse,
    )) as MappedResponseType<R, C["response"]["type"]["out"]["infer"]>;
  });

/*@__NO_SIDE_EFFECTS__*/
export const typedRawFetch = <
  C extends FetchTypeConfig = FetchTypeConfig,
  R extends ResponseType = "json",
>(
  {
    response: responseType,
    query: queryType,
    body: bodyType,
    router: routerType,
  }: C,
  request: string,
  options?: TypedFetchOptions<C, R>,
): Effect.Effect<
  FetchResponse<MappedResponseType<R, C["response"]["type"]["out"]["infer"]>>,
  ArktypeError | FetchError,
  Fetch
> =>
  Effect.gen(function* () {
    const { fetch } = yield* Fetch;
    const { query, body, router, ...opts } = {
      query: undefined,
      body: undefined,
      router: undefined,
      ...options,
    };
    const parsedQuery = queryType?.config.decode
      ? Object.fromEntries(
          Object.entries(query ?? {}).map(([key, value]) => [
            key,
            JSON.stringify(value),
          ]),
        )
      : query;
    const parsedBody = bodyType?.config.decode
      ? Object.fromEntries(
          Object.entries(body ?? {}).map(([key, value]) => [
            key,
            JSON.stringify(value),
          ]),
        )
      : body;
    const parsedRequest = request
      .split("/")
      .filter(Boolean)
      .map((s) => {
        if (!s.startsWith("**") && !s.startsWith(":")) return s;
        const replace = router?.[s.replace("**", "").replace(":", "")];
        if (replace === undefined) return s;
        return routerType?.config.decode
          ? encodePath(JSON.stringify(replace))
          : replace;
      })
      .join("/");

    const fetchResponse = yield* pipe(
      Effect.tryPromise(() =>
        fetch.raw(parsedRequest, {
          ...opts,
          ...(parsedQuery ? { query: parsedQuery } : {}),
          ...(parsedBody ? { body: parsedBody } : {}),
        }),
      ),
      Effect.mapError((error) => new FetchError(error.error as OFetchError)),
      Effect.tapError((error) => Console.log("[ERROR]", error)),
    );

    if (
      ["blob", "text", "arrayBuffer", "stream"].includes(
        (opts as FetchOptions<R>)?.responseType ?? "json",
      )
    )
      return fetchResponse;

    fetchResponse._data = (yield* effectType(
      responseType.type?.out ?? anyObjectType,
      fetchResponse._data,
    )) as MappedResponseType<R, C["response"]["type"]["out"]["infer"]>;
    return fetchResponse;
  });
