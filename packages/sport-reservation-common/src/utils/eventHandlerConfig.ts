import { type } from "arktype";

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
  Q extends ExtendedTypeConfig | type.Any | undefined = undefined,
  B extends ExtendedTypeConfig | type.Any | undefined = undefined,
  R extends ExtendedTypeConfig | type.Any | undefined = undefined,
> = {
  response: Response;
  query?: Q;
  body?: B;
  router?: R;
};

export type EventHandlerTypeConfig<
  Response extends type.Any = any,
  Q extends ExtendedTypeConfig | undefined = ExtendedTypeConfig | undefined,
  B extends ExtendedTypeConfig | undefined = ExtendedTypeConfig | undefined,
  R extends ExtendedTypeConfig | undefined = ExtendedTypeConfig | undefined,
> = {
  response: Response;
  query: Q;
  body: B;
  router: R;
};

export type EventHandlerConfigIn<
  Name extends string,
  Response extends type.Any = type.Any,
  Q extends ExtendedTypeConfig | type.Any | undefined = undefined,
  B extends ExtendedTypeConfig | type.Any | undefined = undefined,
  R extends ExtendedTypeConfig | type.Any | undefined = undefined,
> = {
  name: Name;
  response: Response;
  query?: Q;
  body?: B;
  router?: R;
};

export type EventHandlerConfig<
  Name extends string,
  Response extends type.Any = type.Any,
  Q extends ExtendedTypeConfig | undefined = ExtendedTypeConfig | undefined,
  B extends ExtendedTypeConfig | undefined = ExtendedTypeConfig | undefined,
  R extends ExtendedTypeConfig | undefined = ExtendedTypeConfig | undefined,
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
  C["query"] extends infer Q
    ? Q extends ExtendedTypeConfig
      ? Q["type"]
      : undefined
    : undefined;
export type EventHandlerBodyValidatorType<C extends EventHandlerTypeConfig> =
  C["body"] extends infer B
    ? B extends ExtendedTypeConfig
      ? B["type"]
      : undefined
    : undefined;
export type EventHandlerRouterValidatorType<C extends EventHandlerTypeConfig> =
  C["router"] extends infer R
    ? R extends ExtendedTypeConfig
      ? R["type"]
      : undefined
    : undefined;

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
  C["query"] extends infer Q
    ? Q extends ExtendedTypeConfig
      ? Q["decode"] extends true
        ? EventHandlerClientQueryType<C>
        : never
      : never
    : never;
export type EventHandlerBodyType<C extends EventHandlerTypeConfig> =
  C["body"] extends infer B
    ? B extends ExtendedTypeConfig
      ? B["decode"] extends true
        ? EventHandlerClientBodyType<C>
        : never
      : never
    : never;
export type EventHandlerRouterType<C extends EventHandlerTypeConfig> =
  C["router"] extends infer R
    ? R extends ExtendedTypeConfig
      ? R["decode"] extends true
        ? EventHandlerClientRouterType<C>
        : never
      : never
    : never;

/*@__NO_SIDE_EFFECTS__*/
export const defineEventHandlerConfig = <
  Name extends string,
  Response extends type.Any,
  Q extends ExtendedTypeConfig | type.Any | undefined = undefined,
  B extends ExtendedTypeConfig | type.Any | undefined = undefined,
  R extends ExtendedTypeConfig | type.Any | undefined = undefined,
>({
  name,
  response,
  query,
  body,
  router,
}: EventHandlerConfigIn<Name, Response, Q, B, R>): EventHandlerConfig<
  Name,
  Response,
  [Q] extends [ExtendedTypeConfig]
    ? Q
    : [Q] extends [type.Any]
      ? ExtendedTypeConfig<Q, true>
      : undefined,
  [B] extends [ExtendedTypeConfig]
    ? B
    : [B] extends [type.Any]
      ? ExtendedTypeConfig<B, true>
      : undefined,
  [R] extends [ExtendedTypeConfig]
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
      : undefined) as [Q] extends [ExtendedTypeConfig]
      ? Q
      : [Q] extends [type.Any]
        ? ExtendedTypeConfig<Q, true>
        : undefined,
    body: (body
      ? "__type" in body
        ? body
        : defineExtendedTypeConfig({ type: body })
      : undefined) as [B] extends [ExtendedTypeConfig]
      ? B
      : [B] extends [type.Any]
        ? ExtendedTypeConfig<B, true>
        : undefined,
    router: (router
      ? "__type" in router
        ? router
        : defineExtendedTypeConfig({ type: router })
      : undefined) as [R] extends [ExtendedTypeConfig]
      ? R
      : [R] extends [type.Any]
        ? ExtendedTypeConfig<R, true>
        : undefined,
  };
};
