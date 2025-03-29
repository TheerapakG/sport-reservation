import { decodeMultiStream } from "@msgpack/msgpack";
import { Context, Effect, Layer, Stream } from "effect";
import { Simplify } from "effect/Types";
import { FetchOptions, MappedResponseType, ofetch, ResponseType } from "ofetch";
import type { Mock } from "vitest";
import {
  FetchBodyValidatorType,
  FetchQueryValidatorType,
  FetchResponseType,
  FetchResponseValidatorType,
  FetchRouterValidatorType,
  FetchTypeConfig,
} from "~~/src/config";
import { ArktypeError, FetchError, MsgpackError } from "~~/src/models/errors";
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
  config: FetchTypeConfig;
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
type StreamServerMethod<
  Opts extends Record<string, unknown> = Record<string, unknown>,
  A = unknown,
  E = FetchError | ArktypeError | MsgpackError,
  R = never,
> = (opts: Opts) => Stream.Stream<A, E | FetchError | ArktypeError, R>;

export type TypedRouteParamsOptions<SR extends ServerRoute> =
  SR extends infer _SR
    ? _SR extends ServerRoute
      ? TypedFetchParamsOptions<_SR["config"]>
      : never
    : never;

export type TypedRouteOptions<
  SR extends ServerRoute,
  R extends ResponseType = "json",
> = SR extends infer _SR
  ? _SR extends ServerRoute
    ? TypedFetchOptions<_SR["config"], R>
    : never
  : never;

const mergeOptions = <SR extends ServerRoute, R extends ResponseType = "json">(
  opts: Pick<TypedRouteOptions<SR, R>, "method" | "responseType">,
  params: Omit<TypedRouteOptions<SR, R>, "method" | "responseType">,
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
    route: { config, path, method },
  }: {
    fetch: Context.Tag.Service<Fetch>;
    route: SR;
  }): ServerMethod<
    Omit<TypedRouteOptions<SR, "json">, "method" | "responseType">,
    MappedResponseType<"json", FetchResponseType<SR["config"]>>
  > =>
  (params: Omit<TypedRouteOptions<SR, "json">, "method" | "responseType">) =>
    Effect.provideService(
      typedFetch<SR["config"], "json">(
        config,
        path,
        mergeOptions({ method, responseType: "json" }, params),
      ),
      Fetch,
      fetch,
    );

/*@__NO_SIDE_EFFECTS__*/
const createStreamServerMethod =
  <SR extends ServerRoute>({
    fetch,
    route: { config, path, method },
  }: {
    fetch: Context.Tag.Service<Fetch>;
    route: SR;
  }): StreamServerMethod<
    Omit<TypedRouteOptions<SR, "stream">, "method" | "responseType">,
    MappedResponseType<"stream", FetchResponseType<SR["config"]>>
  > =>
  (params: Omit<TypedRouteOptions<SR, "stream">, "method" | "responseType">) =>
    Stream.provideService(
      Stream.fromEffect(
        typedFetch<SR["config"], "stream">(
          config,
          path,
          mergeOptions({ method, responseType: "stream" }, params),
        ),
      )
        .pipe(
          Stream.flatMap((stream) =>
            Stream.fromAsyncIterable(
              (async function* () {
                for await (const item of decodeMultiStream(stream)) {
                  yield effectType<FetchResponseValidatorType<SR["config"]>>(
                    config.response.type,
                    item,
                  );
                }
              })(),
              (e) => new MsgpackError(e as Error),
            ),
          ),
        )
        .pipe(Stream.flatMap((effect) => Stream.fromEffect(effect))),
      Fetch,
      fetch,
    );

/*@__NO_SIDE_EFFECTS__*/
const createMockMethod = async <SR extends ServerRoute>({
  route: { config },
}: {
  route: SR;
}): Promise<{
  mock: Mock<
    ServerMethod<
      TypedRouteParamsOptions<SR>,
      MappedResponseType<"json", FetchResponseType<SR["config"]>>
    >
  >;
  method: ServerMethod<
    TypedRouteParamsOptions<SR>,
    MappedResponseType<"json", FetchResponseType<SR["config"]>>
  >;
}> => {
  const { vi } = await import("vitest");

  const mock = vi.fn() as Mock<
    ServerMethod<
      TypedRouteParamsOptions<SR>,
      MappedResponseType<"json", FetchResponseType<SR["config"]>>
    >
  >;
  return {
    mock,
    method: (opts) => effectType(config.response.type, mock(opts)),
  };
};

/*@__NO_SIDE_EFFECTS__*/
const createMockStreamMethod = async <SR extends ServerRoute>({
  route: { config },
}: {
  route: SR;
}): Promise<{
  mock: Mock<
    StreamServerMethod<
      TypedRouteParamsOptions<SR>,
      MappedResponseType<"stream", FetchResponseType<SR["config"]>>
    >
  >;
  method: StreamServerMethod<
    TypedRouteParamsOptions<SR>,
    MappedResponseType<"stream", FetchResponseType<SR["config"]>>
  >;
}> => {
  const { vi } = await import("vitest");

  const mock = vi.fn() as Mock<
    StreamServerMethod<
      TypedRouteParamsOptions<SR>,
      MappedResponseType<"stream", FetchResponseType<SR["config"]>>
    >
  >;
  return {
    mock,
    method: (opts) => effectType(config.response.type, mock(opts)),
  };
};

export type Mocks<SR extends ServerRoutes> = {
  [K in keyof SR]: Mock<
    ServerMethod<
      TypedRouteParamsOptions<SR[K]>,
      FetchResponseType<SR[K]["config"]>
    >
  >;
};

export type Client<
  SR extends ServerRoutes,
  CM extends ClientMethods,
> = Simplify<
  {
    [K in keyof SR]: SR[K]["config"]["response"]["config"]["stream"] extends true
      ? StreamServerMethod<
          Omit<TypedRouteOptions<SR[K], "stream">, "method">,
          FetchResponseType<SR[K]["config"]>
        >
      : ServerMethod<
          Omit<TypedRouteOptions<SR[K], "json">, "method">,
          FetchResponseType<SR[K]["config"]>
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
          route.config.response.config.stream
            ? createStreamServerMethod({
                fetch,
                route,
              })
            : createServerMethod({
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
            route.config.response.config.stream
              ? await createMockStreamMethod({
                  route,
                })
              : await createMockMethod({
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
): FetchResponseValidatorType<SR[K]["config"]> => {
  return serverRoutes[name].config.response.type;
};

export const getClientQueryType = <SR extends ServerRoutes, K extends keyof SR>(
  serverRoutes: SR,
  name: K,
): FetchQueryValidatorType<SR[K]["config"]> => {
  return serverRoutes[name].config.query?.type as FetchQueryValidatorType<
    SR[K]["config"]
  >;
};

export const getClientBodyType = <SR extends ServerRoutes, K extends keyof SR>(
  serverRoutes: SR,
  name: K,
): FetchBodyValidatorType<SR[K]["config"]> => {
  return serverRoutes[name].config.body?.type as FetchBodyValidatorType<
    SR[K]["config"]
  >;
};

export const getClientRouterType = <
  SR extends ServerRoutes,
  K extends keyof SR,
>(
  serverRoutes: SR,
  name: K,
): FetchRouterValidatorType<SR[K]["config"]> => {
  return serverRoutes[name].config.router?.type as FetchRouterValidatorType<
    SR[K]["config"]
  >;
};
