import { Context, Effect, Layer } from "effect";
import { Simplify } from "effect/Types";
import { FetchOptions, MappedResponseType, ofetch, ResponseType } from "ofetch";
import type { Mock } from "vitest";
import {
  EventHandlerBodyValidatorType,
  EventHandlerClientResponseType,
  EventHandlerQueryValidatorType,
  EventHandlerResponseValidatorType,
  EventHandlerRouterValidatorType,
  EventHandlerTypeConfig,
} from "~~/src/config/eventHandlerConfig";
import { ArktypeError, FetchError } from "~~/src/models/errors";
import { effectType } from "~~/src/utils/effectType";
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

type ServerRoute = {
  config: EventHandlerTypeConfig;
  path: string;
  method: string;
};

type ServerRoutes = {
  [name: string]: ServerRoute;
};

type ClientMethod = {
  config: unknown;
  method: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    opts: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Effect.Effect<any, any, any>;
};

type ClientMethods = {
  [name: string]: ClientMethod;
};

type ServerMethod<
  Opts extends Record<string, unknown> = Record<string, unknown>,
  A = unknown,
  E = FetchError | ArktypeError,
  R = never,
> = (opts: Opts) => Effect.Effect<A, E | FetchError | ArktypeError, R>;

export type TypedRouteParamsOptions<SR extends ServerRoute> =
  SR extends infer _SR
    ? _SR extends ServerRoute
      ? TypedFetchParamsOptions<
          EventHandlerQueryValidatorType<_SR["config"]>,
          EventHandlerBodyValidatorType<_SR["config"]>,
          EventHandlerRouterValidatorType<_SR["config"]>
        >
      : never
    : never;

export type TypedRouteOptions<
  SR extends ServerRoute,
  R extends ResponseType = "json",
> = SR extends infer _SR
  ? _SR extends ServerRoute
    ? TypedFetchOptions<
        EventHandlerQueryValidatorType<_SR["config"]>,
        EventHandlerBodyValidatorType<_SR["config"]>,
        EventHandlerRouterValidatorType<_SR["config"]>,
        R
      >
    : never
  : never;

const mergeOptions = <SR extends ServerRoute, R extends ResponseType = "json">(
  opts: Pick<TypedRouteOptions<SR, R>, "method">,
  params: Omit<TypedRouteOptions<SR, R>, "method">,
): TypedRouteOptions<SR, R> => {
  return {
    ...opts,
    ...params,
  } as TypedRouteOptions<SR, R>;
};

/*@__NO_SIDE_EFFECTS__*/
const createServerMethod =
  <SR extends ServerRoute>({
    fetch,
    route: {
      config: { response: responseType, query, body, router },
      path,
      method,
    },
  }: {
    fetch: Context.Tag.Service<Fetch>;
    route: SR;
  }): ServerMethod<
    Omit<TypedRouteOptions<SR, "json">, "method">,
    MappedResponseType<"json", EventHandlerClientResponseType<SR["config"]>>
  > =>
  (params: Omit<TypedRouteOptions<SR, "json">, "method">) =>
    Effect.provideService(
      typedFetch<
        EventHandlerResponseValidatorType<SR["config"]>,
        EventHandlerQueryValidatorType<SR["config"]>,
        EventHandlerBodyValidatorType<SR["config"]>,
        EventHandlerRouterValidatorType<SR["config"]>,
        "json"
      >(
        {
          responseType,
          queryType: query?.type as
            | EventHandlerQueryValidatorType<SR["config"]>
            | undefined,
          bodyType: body?.type as
            | EventHandlerBodyValidatorType<SR["config"]>
            | undefined,
          routerType: router?.type as
            | EventHandlerRouterValidatorType<SR["config"]>
            | undefined,
        },
        path,
        mergeOptions({ method }, params),
      ),
      Fetch,
      fetch,
    );

/*@__NO_SIDE_EFFECTS__*/
const createMockMethod = async <SR extends ServerRoute>({
  route: {
    config: { response },
  },
}: {
  route: SR;
}): Promise<{
  mock: Mock<
    ServerMethod<
      TypedRouteParamsOptions<SR>,
      MappedResponseType<"json", EventHandlerClientResponseType<SR["config"]>>
    >
  >;
  method: ServerMethod<
    TypedRouteParamsOptions<SR>,
    MappedResponseType<"json", EventHandlerClientResponseType<SR["config"]>>
  >;
}> => {
  const { vi } = await import("vitest");

  const mock = vi.fn() as Mock<
    ServerMethod<
      TypedRouteParamsOptions<SR>,
      MappedResponseType<"json", EventHandlerClientResponseType<SR["config"]>>
    >
  >;
  return { mock, method: (opts) => effectType(response, mock(opts)) };
};

export type Mocks<SR extends ServerRoutes> = {
  [K in keyof SR]: Mock<
    ServerMethod<
      TypedRouteParamsOptions<SR[K]>,
      EventHandlerClientResponseType<SR[K]["config"]>
    >
  >;
};

export type Client<
  SR extends ServerRoutes,
  CM extends ClientMethods,
> = Simplify<
  {
    [K in keyof SR]: ServerMethod<
      Omit<TypedRouteOptions<SR[K], "json">, "method">,
      EventHandlerClientResponseType<SR[K]["config"]>
    >;
  } & {
    [K in keyof CM]: CM[K]["method"];
  }
>;

/*@__NO_SIDE_EFFECTS__*/
export const createClient = <
  SR extends ServerRoutes,
  CM extends ClientMethods,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Context.Tag<any, Client<SR, CM>>,
>(
  tag: T,
  serverRoutes: SR,
  clientMethods: CM,
) =>
  Layer.effect(
    tag,
    Effect.gen(function* () {
      const fetch = yield* Fetch;
      return Object.fromEntries([
        ...Object.entries(serverRoutes).map(([name, route]) => [
          name,
          createServerMethod({
            fetch,
            route,
          }),
        ]),
        ...Object.entries(clientMethods).map(([name, method]) => [
          name,
          method,
        ]),
      ]) as Context.Tag.Service<T>;
    }),
  );

/*@__NO_SIDE_EFFECTS__*/
export const createMockClient = async <
  SR extends ServerRoutes,
  CM extends ClientMethods,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Context.Tag<any, Client<SR, CM>>,
>(
  tag: T,
  serverRoutes: SR,
  clientMethods: CM,
) => {
  const serverMethods = Object.fromEntries(
    await Promise.all(
      Object.entries(serverRoutes).map(
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
      Object.entries(serverMethods).map(([name, { mock }]) => [name, mock]),
    ) as Mocks<SR>,
    client: Layer.succeed(
      tag,
      Object.fromEntries([
        ...Object.entries(serverMethods).map(([name, { method }]) => [
          name,
          method,
        ]),
        ...Object.entries(clientMethods).map(([name, method]) => [
          name,
          method,
        ]),
      ]) as Context.Tag.Service<T>,
    ),
  };
};

export const getClientResponseType = <
  SR extends ServerRoutes,
  K extends keyof SR,
>(
  serverRoutes: SR,
  name: K,
): EventHandlerResponseValidatorType<SR[K]["config"]> => {
  return serverRoutes[name].config.response;
};

export const getClientQueryType = <SR extends ServerRoutes, K extends keyof SR>(
  serverRoutes: SR,
  name: K,
): EventHandlerQueryValidatorType<SR[K]["config"]> => {
  return serverRoutes[name].config.query
    ?.type as EventHandlerQueryValidatorType<SR[K]["config"]>;
};

export const getClientBodyType = <SR extends ServerRoutes, K extends keyof SR>(
  serverRoutes: SR,
  name: K,
): EventHandlerBodyValidatorType<SR[K]["config"]> => {
  return serverRoutes[name].config.body?.type as EventHandlerBodyValidatorType<
    SR[K]["config"]
  >;
};

export const getClientRouterType = <
  SR extends ServerRoutes,
  K extends keyof SR,
>(
  serverRoutes: SR,
  name: K,
): EventHandlerRouterValidatorType<SR[K]["config"]> => {
  return serverRoutes[name].config.router
    ?.type as EventHandlerRouterValidatorType<SR[K]["config"]>;
};
