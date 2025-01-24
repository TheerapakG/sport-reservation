import { type } from "arktype";

type IsAny<T> = boolean extends (T extends never ? true : false) ? true : false;

export type ExtendedTypeConfigIn<
  T extends type.Any = type.Any,
  D extends boolean = true,
> = {
  type: T;
  decode?: D;
};

export type ExtendedTypeConfig<
  T extends type.Any = type.Any,
  D extends boolean = boolean,
> = {
  __type: "ExtendedHandlerConfigType";
  type: T;
  decode: D;
};

/*@__NO_SIDE_EFFECTS__*/ export const defineExtendedTypeConfig = <
  T extends type.Any,
  D extends boolean,
>(
  config: ExtendedTypeConfigIn<T, D>,
): ExtendedTypeConfig<T, D> => {
  return {
    decode: true as D,
    ...config,
    __type: "ExtendedHandlerConfigType",
  };
};

export type EventHandlerTypeConfigIn<
  Response extends type.Any = type.Any,
  Q extends ExtendedTypeConfig | type.Any = any,
  B extends ExtendedTypeConfig | type.Any = any,
  R extends ExtendedTypeConfig | type.Any = any,
> = {
  response: Response;
  query?: Q;
  body?: B;
  router?: R;
};

export type EventHandlerTypeConfig<
  Response extends type.Any = any,
  Q extends ExtendedTypeConfig | undefined = any,
  B extends ExtendedTypeConfig | undefined = any,
  R extends ExtendedTypeConfig | undefined = any,
> = {
  response: Response;
  query: Q;
  body: B;
  router: R;
};

export type EventHandlerConfigIn<
  Name extends string,
  Response extends type.Any = type.Any,
  Q extends ExtendedTypeConfig | type.Any = any,
  B extends ExtendedTypeConfig | type.Any = any,
  R extends ExtendedTypeConfig | type.Any = any,
> = {
  name: Name;
  response: Response;
  query?: Q;
  body?: B;
  router?: R;
};

export type EventHandlerConfig<
  Name extends string,
  Response extends type.Any = any,
  Q extends ExtendedTypeConfig | undefined = any,
  B extends ExtendedTypeConfig | undefined = any,
  R extends ExtendedTypeConfig | undefined = any,
> = {
  name: Name;
  response: Response;
  query: Q;
  body: B;
  router: R;
};

export type EventHandlerResponseValidatorType<
  C extends EventHandlerTypeConfig,
> = C["response"];
export type EventHandlerQueryValidatorType<C extends EventHandlerTypeConfig> =
  C["query"]["type"];
export type EventHandlerBodyValidatorType<C extends EventHandlerTypeConfig> =
  C["body"]["type"];
export type EventHandlerRouterValidatorType<C extends EventHandlerTypeConfig> =
  C["router"]["type"];

export type EventHandlerClientResponseType<C extends EventHandlerTypeConfig> =
  EventHandlerResponseValidatorType<C>["infer"];
export type EventHandlerClientQueryType<C extends EventHandlerTypeConfig> =
  EventHandlerQueryValidatorType<C> extends type.Any
    ? EventHandlerQueryValidatorType<C>["infer"]
    : never;
export type EventHandlerClientBodyType<C extends EventHandlerTypeConfig> =
  EventHandlerBodyValidatorType<C> extends type.Any
    ? EventHandlerBodyValidatorType<C>["infer"]
    : never;
export type EventHandlerClientRouterType<C extends EventHandlerTypeConfig> =
  EventHandlerRouterValidatorType<C> extends type.Any
    ? EventHandlerRouterValidatorType<C>["infer"]
    : never;

export type EventHandlerResponseType<C extends EventHandlerTypeConfig> =
  EventHandlerClientResponseType<C>;
export type EventHandlerQueryType<C extends EventHandlerTypeConfig> =
  C["query"]["decode"] extends true ? EventHandlerClientQueryType<C> : never;
export type EventHandlerBodyType<C extends EventHandlerTypeConfig> =
  C["body"]["decode"] extends true ? EventHandlerClientBodyType<C> : never;
export type EventHandlerRouterType<C extends EventHandlerTypeConfig> =
  C["router"]["decode"] extends true ? EventHandlerClientRouterType<C> : never;

/*@__NO_SIDE_EFFECTS__*/
export const defineEventHandlerConfig = <
  Name extends string,
  Response extends type.Any,
  Q extends ExtendedTypeConfig | type.Any = any,
  B extends ExtendedTypeConfig | type.Any = any,
  R extends ExtendedTypeConfig | type.Any = any,
>({
  name,
  response,
  query,
  body,
  router,
}: EventHandlerConfigIn<Name, Response, Q, B, R>): EventHandlerConfig<
  Name,
  Response,
  true extends IsAny<Q>
    ? undefined
    : [Q] extends [ExtendedTypeConfig]
      ? Q
      : [Q] extends [type.Any]
        ? ExtendedTypeConfig<Q, true>
        : undefined,
  true extends IsAny<B>
    ? undefined
    : [B] extends [ExtendedTypeConfig]
      ? B
      : [B] extends [type.Any]
        ? ExtendedTypeConfig<B, true>
        : undefined,
  true extends IsAny<R>
    ? undefined
    : [R] extends [ExtendedTypeConfig]
      ? R
      : [R] extends [type.Any]
        ? ExtendedTypeConfig<R, true>
        : undefined
> => {
  return {
    name,
    response,
    query: (query
      ? "__type" in query
        ? query
        : defineExtendedTypeConfig({ type: query })
      : undefined) as true extends IsAny<Q>
      ? undefined
      : [Q] extends [ExtendedTypeConfig]
        ? Q
        : [Q] extends [type.Any]
          ? ExtendedTypeConfig<Q, true>
          : undefined,
    body: (body
      ? "__type" in body
        ? body
        : defineExtendedTypeConfig({ type: body })
      : undefined) as true extends IsAny<B>
      ? undefined
      : [B] extends [ExtendedTypeConfig]
        ? B
        : [B] extends [type.Any]
          ? ExtendedTypeConfig<B, true>
          : undefined,
    router: (router
      ? "__type" in router
        ? router
        : defineExtendedTypeConfig({ type: router })
      : undefined) as true extends IsAny<R>
      ? undefined
      : [R] extends [ExtendedTypeConfig]
        ? R
        : [R] extends [type.Any]
          ? ExtendedTypeConfig<R, true>
          : undefined,
  };
};
