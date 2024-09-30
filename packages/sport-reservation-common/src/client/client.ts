import { Context, Effect, Layer } from "effect";
import { Simplify } from "effect/Types";
import { FetchOptions, MappedResponseType, ofetch } from "ofetch";
import { ArktypeError, FetchError } from "~~/src/models/errors";
import {
  EventHandlerBody,
  EventHandlerQuery,
  EventHandlerResponse,
  EventHandlerResponseType,
  EventHandlerRouter,
  EventHandlerTypeConfig,
} from "~~/src/utils/eventHandlerConfig";
import {
  Fetch,
  typedFetch,
  TypedFetchOptions,
  TypedFetchParamsOptions,
  withMock,
} from "~~/src/utils/fetch";

export { Fetch };

/*@__NO_SIDE_EFFECTS__*/
export const createFetch = (
  opts: Simplify<
    Omit<FetchOptions, "baseURL"> & Required<Pick<FetchOptions, "baseURL">>
  >,
) => ofetch.create(opts);

type ClientRoute = Simplify<
  EventHandlerTypeConfig & {
    path: string;
    method: string;
  }
>;

type ClientRoutes = {
  [name: string]: ClientRoute;
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

export type TypedRouteParamsOptions<CR extends ClientRoute> =
  CR extends infer _CR
    ? _CR extends ClientRoute
      ? TypedFetchParamsOptions<_CR["query"], _CR["body"], _CR["router"]>
      : never
    : never;

/*@__NO_SIDE_EFFECTS__*/
const createMethod = <CR extends ClientRoute>({
  fetch,
  route: {
    response,
    query: queryParams,
    body: bodyParams,
    router: routerParams,
    path,
    method,
  },
}: {
  fetch: Context.Tag.Service<Fetch>;
  route: CR;
}): Method<
  TypedRouteParamsOptions<CR>,
  MappedResponseType<"json", EventHandlerResponseType<CR>>
> =>
  withMock(({ query, body, router }) =>
    Effect.provideService(
      typedFetch<
        EventHandlerResponse<CR>,
        EventHandlerQuery<CR>,
        EventHandlerBody<CR>,
        EventHandlerRouter<CR>,
        "json"
      >({ response, queryParams, bodyParams, routerParams }, path, {
        method,
        query,
        body,
        router,
      } as TypedFetchOptions<
        EventHandlerQuery<CR>,
        EventHandlerBody<CR>,
        EventHandlerRouter<CR>
      >),
      Fetch,
      fetch,
    ),
  );

export type Client<CR extends ClientRoutes> = {
  [K in keyof CR]: Method<
    TypedRouteParamsOptions<CR[K]>,
    EventHandlerResponseType<CR[K]>
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
        Object.entries(clientRoutes).map(([name, route]) => [
          name,
          createMethod({
            fetch,
            route,
          }),
        ]),
      ) as Context.Tag.Service<T>;
    }),
  );
