import { Context, Effect, Layer } from "effect";
import { Simplify } from "effect/Types";
import { FetchOptions, MappedResponseType, ofetch } from "ofetch";
import type { Mock } from "vitest";
import { ArktypeError, FetchError } from "~~/src/models/errors";
import { effectType } from "~~/src/utils/effectType";
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
> = (opts: Opts) => Effect.Effect<A, E | FetchError | ArktypeError, R>;

export type TypedRouteParamsOptions<CR extends ClientRoute> =
  CR extends infer _CR
    ? _CR extends ClientRoute
      ? TypedFetchParamsOptions<_CR["query"], _CR["body"], _CR["router"]>
      : never
    : never;

/*@__NO_SIDE_EFFECTS__*/
const createMethod =
  <CR extends ClientRoute>({
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
  ({ query, body, router }) =>
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
    );

/*@__NO_SIDE_EFFECTS__*/
const createMockMethod = async <CR extends ClientRoute>({
  route: { response },
}: {
  route: CR;
}): Promise<{
  mock: Mock<
    Method<
      TypedRouteParamsOptions<CR>,
      MappedResponseType<"json", EventHandlerResponseType<CR>>
    >
  >;
  method: Method<
    TypedRouteParamsOptions<CR>,
    MappedResponseType<"json", EventHandlerResponseType<CR>>
  >;
}> => {
  const { vi } = await import("vitest");

  const mock = vi.fn() as Mock<
    Method<
      TypedRouteParamsOptions<CR>,
      MappedResponseType<"json", EventHandlerResponseType<CR>>
    >
  >;
  return { mock, method: (opts) => effectType(response, mock(opts)) };
};

export type Mocks<CR extends ClientRoutes> = {
  [K in keyof CR]: Mock<
    Method<TypedRouteParamsOptions<CR[K]>, EventHandlerResponseType<CR[K]>>
  >;
};

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

/*@__NO_SIDE_EFFECTS__*/
export const createMockClient = async <
  CR extends ClientRoutes,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Context.Tag<any, Client<CR>>,
>(
  tag: T,
  clientRoutes: CR,
) => {
  const methods = Object.fromEntries(
    await Promise.all(
      Object.entries(clientRoutes).map(
        async ([name, route]) =>
          [
            name,
            await createMockMethod({
              route,
            }),
          ] as const,
      ),
    ),
  );

  return {
    mocks: Object.fromEntries(
      Object.entries(methods).map(([name, { mock }]) => [name, mock]),
    ) as Mocks<CR>,
    client: Layer.succeed(
      tag,
      Object.fromEntries(
        Object.entries(methods).map(([name, { method }]) => [name, method]),
      ) as Context.Tag.Service<T>,
    ),
  };
};
