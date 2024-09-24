import { Type } from "arktype";
import { Context, Effect, Layer } from "effect";
import { Simplify } from "effect/Types";
import { FetchOptions, MappedResponseType, ResponseType, ofetch } from "ofetch";
import { ArktypeError, FetchError } from "~~/models/errors";
import {
  Fetch,
  typedFetch,
  TypedFetchParamsOptions,
  withMock,
} from "~~/utils/fetch";

export { Fetch };

/*@__NO_SIDE_EFFECTS__*/
export const createFetch = (
  opts: Simplify<
    Omit<FetchOptions, "baseURL"> & Required<Pick<FetchOptions, "baseURL">>
  >,
) => ofetch.create(opts);

type ClientRoutes = {
  [method: string]: {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    response: Type<unknown, {}>;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    query: Type<unknown, {}>;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    body: Type<unknown, {}>;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    router: Type<unknown, {}>;
    path: string;
    method: string;
  };
};

type Method<
  Opts extends Record<string, unknown> = Record<string, unknown>,
  A = unknown,
  E = FetchError | ArktypeError,
  R = never,
> = (
  opts: Opts & {
    mock?: Effect.Effect<A, E, never>;
  },
) => Effect.Effect<A, E, R>;

/*@__NO_SIDE_EFFECTS__*/
const createMethod = <
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  QP extends Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  BP extends Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  RP extends Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Response extends Type<unknown, {}>,
  R extends ResponseType = "json",
>({
  fetch,
  response,
  query: queryParams,
  body: bodyParams,
  router: routerParams,
  path,
  method,
}: {
  fetch: Context.Tag.Service<Fetch>;
  response: Response;
  query: QP;
  body: BP;
  router: RP;
  path: string;
  method: string;
}): Method<
  TypedFetchParamsOptions<QP, BP, RP>,
  MappedResponseType<R, typeof response.infer>
> =>
  withMock(({ query, body, router }) =>
    Effect.provideService(
      typedFetch<Response, QP, BP, RP, R>(
        { response, queryParams, bodyParams, routerParams },
        path,
        {
          method,
          query,
          body,
          router,
        },
      ),
      Fetch,
      fetch,
    ),
  );

export type Client<CR extends ClientRoutes> = {
  [K in keyof CR]: Method<
    TypedFetchParamsOptions<CR[K]["query"], CR[K]["body"], CR[K]["router"]>,
    CR[K]["response"]["infer"]
  >;
};

/*@__NO_SIDE_EFFECTS__*/
export const createClient = <
  CR extends ClientRoutes,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Context.Tag<any, Client<CR>>,
>(
  tag: T,
  clientRoutes: CR,
) =>
  Layer.effect(
    tag,
    Effect.gen(function* () {
      const fetch = yield* Fetch;
      return Object.fromEntries(
        Object.entries(clientRoutes).map(
          ([name, { response, query, body, router, path, method }]) => [
            name,
            createMethod({
              fetch,
              response,
              query,
              body,
              router,
              path,
              method,
            }),
          ],
        ),
      ) as Context.Tag.Service<T>;
    }),
  );
