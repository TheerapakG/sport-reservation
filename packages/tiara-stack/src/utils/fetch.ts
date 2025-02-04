import { type } from "arktype";
import { Context, Effect } from "effect";
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
import { ArktypeError, FetchError } from "~~/src/models/errors";
import { effectType } from "~~/src/utils/effectType";
import { anyObjectType } from "./type";

export class Fetch
  extends /*@__PURE__*/ Context.Tag("FetchService")<
    Fetch,
    { fetch: $Fetch }
  >() {}

export type TypedFetchParamsOptions<
  QP extends type.Any | undefined,
  BP extends type.Any | undefined,
  RP extends type.Any | undefined,
> = Simplify<
  ([QP] extends [type.Any]
    ? QP["infer"] extends Record<string, unknown>
      ? {
          query: QP["infer"];
        }
      : { query?: never }
    : { query?: never }) &
    ([BP] extends [type.Any]
      ? BP["infer"] extends unknown
        ? { body: NonNullable<RequestInit["body"]> | BP["infer"] }
        : { body?: never }
      : { body?: never }) &
    ([RP] extends [type.Any]
      ? RP["infer"] extends Record<string, unknown>
        ? { router: RP["infer"] }
        : { router?: never }
      : { router?: never })
>;

export type TypedFetchOptions<
  QP extends type.Any | undefined,
  BP extends type.Any | undefined,
  RP extends type.Any | undefined,
  R extends ResponseType = "json",
> = Omit<FetchOptions<R>, "query" | "body" | "router"> &
  TypedFetchParamsOptions<QP, BP, RP>;

/*@__NO_SIDE_EFFECTS__*/
export const typedFetch = <
  T extends type.Any,
  QP extends type.Any | undefined,
  BP extends type.Any | undefined,
  RP extends type.Any | undefined,
  R extends ResponseType = "json",
>(
  {
    responseType,
  }: {
    responseType?: T;
    queryType?: QP;
    bodyType?: BP;
    routerType?: RP;
  },
  request: string,
  options?: TypedFetchOptions<QP, BP, RP, R>,
): Effect.Effect<
  MappedResponseType<R, T["infer"]>,
  ArktypeError | FetchError,
  Fetch
> =>
  Effect.gen(function* () {
    const { fetch } = yield* Fetch;
    const { router, ...opts } = { router: undefined, ...options };
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
      (responseType ?? anyObjectType) as T,
      fetchResponse,
    )) as MappedResponseType<R, T["infer"]>;
  });

/*@__NO_SIDE_EFFECTS__*/
export const typedRawFetch = <
  T extends type.Any,
  QP extends type.Any | undefined,
  BP extends type.Any | undefined,
  RP extends type.Any | undefined,
  R extends ResponseType = "json",
>(
  {
    responseType,
  }: {
    responseType?: T;
    queryType?: QP;
    bodyType?: BP;
    routerType?: RP;
  },
  request: string,
  options?: TypedFetchOptions<QP, BP, RP, R>,
): Effect.Effect<
  FetchResponse<MappedResponseType<R, T["infer"]>>,
  ArktypeError | FetchError,
  Fetch
> =>
  Effect.gen(function* () {
    const { fetch } = yield* Fetch;
    const { router, ...opts } = { router: undefined, ...options };
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
      (responseType ?? anyObjectType) as T,
      fetchResponse._data,
    )) as MappedResponseType<R, T["infer"]>;
    return fetchResponse;
  });
