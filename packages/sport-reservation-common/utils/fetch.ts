import { Effect, Context } from "effect";
import {
  $Fetch,
  ResponseType,
  FetchOptions,
  FetchError as OFetchError,
  FetchResponse,
  MappedResponseType,
} from "ofetch";
import { Type } from "arktype";
import { effectType } from "~~/utils/effectType";
import { encodePath } from "ufo";
import { ArktypeError, FetchError } from "~~/models/errors";
import { anyObjectType } from "./type";

export class Fetch
  extends /*@__PURE__*/ Context.Tag("FetchService")<
    Fetch,
    { fetch: $Fetch }
  >() {}

export type TypedFetchParamsOptions<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  QP extends Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  BP extends Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  RP extends Type<unknown, {}>,
> = (QP["inferIn"] extends Record<string, string>
  ? {
      query: { [K in keyof QP["inferIn"]]: unknown };
    }
  : { query?: Record<string, unknown> }) &
  (BP["inferIn"] extends Record<string, unknown>
    ? {
        body: { [K in keyof BP["inferIn"]]: unknown };
      }
    : { body?: RequestInit["body"] | Record<string, unknown> }) &
  (RP["inferIn"] extends Record<string, unknown>
    ? {
        router: { [K in keyof RP["inferIn"]]: unknown };
      }
    : { router?: Record<string, unknown> });

export type TypedFetchOptions<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  QP extends Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  BP extends Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  RP extends Type<unknown, {}>,
  R extends ResponseType = "json",
> = FetchOptions<R> & TypedFetchParamsOptions<QP, BP, RP>;

/*@__NO_SIDE_EFFECTS__*/
export const typedFetch = <
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  T extends Type<unknown, {}> = Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  QP extends Type<unknown, {}> = Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  BP extends Type<unknown, {}> = Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  RP extends Type<unknown, {}> = Type<unknown, {}>,
  R extends ResponseType = "json",
>(
  {
    response,
  }: { response?: T; queryParams?: QP; bodyParams?: BP; routerParams?: RP },
  request: string,
  options?: TypedFetchOptions<QP, BP, RP, R>,
): Effect.Effect<
  MappedResponseType<R, T["infer"]>,
  ArktypeError | FetchError,
  Fetch
> =>
  Effect.gen(function* () {
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

    const fetchResponse = yield* Effect.mapError(
      Effect.tryPromise(() => fetch(parsedRequest, opts)),
      (error) => new FetchError(error.error as OFetchError),
    );

    if (
      ["blob", "text", "arrayBuffer", "stream"].includes(
        (opts as FetchOptions<R>)?.responseType ?? "json",
      )
    )
      return fetchResponse as MappedResponseType<R, T["infer"]>;
    return (yield* effectType(
      (response ?? anyObjectType) as T,
      fetchResponse,
    )) as MappedResponseType<R, T["infer"]>;
  });

/*@__NO_SIDE_EFFECTS__*/
export const typedRawFetch = <
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  T extends Type<unknown, {}> = Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  QP extends Type<unknown, {}> = Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  BP extends Type<unknown, {}> = Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  RP extends Type<unknown, {}> = Type<unknown, {}>,
  R extends ResponseType = "json",
>(
  { response }: { response?: T; queryParams?: QP; routerParams?: RP },
  request: string,
  options?: TypedFetchOptions<QP, BP, RP, R>,
): Effect.Effect<
  FetchResponse<MappedResponseType<R, T["infer"]>>,
  ArktypeError | FetchError,
  Fetch
> =>
  Effect.gen(function* () {
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

    const fetchResponse = yield* Effect.mapError(
      Effect.tryPromise(() => fetch.raw(parsedRequest, opts)),
      (error) => new FetchError(error.error as OFetchError),
    );

    if (
      ["blob", "text", "arrayBuffer", "stream"].includes(
        (opts as FetchOptions<R>)?.responseType ?? "json",
      )
    )
      return fetchResponse;

    fetchResponse._data = (yield* effectType(
      (response ?? anyObjectType) as T,
      fetchResponse._data,
    )) as MappedResponseType<R, T["infer"]>;
    return fetchResponse;
  });

/*@__NO_SIDE_EFFECTS__*/
export const withMock = <
  A,
  E,
  R = never,
  Opts extends Record<string, unknown> = Record<string, unknown>,
>(
  fetch: (opts: Opts) => Effect.Effect<A, E, R>,
) => {
  return (
    opts: Opts & {
      mock?: Effect.Effect<A, E, never>;
    },
  ) => {
    const { mock } = opts ?? {};
    return mock ?? fetch(opts);
  };
};
