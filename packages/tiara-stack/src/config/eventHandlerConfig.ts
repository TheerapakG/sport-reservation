import { type } from "arktype";
import { Simplify } from "effect/Types";
import { ParamsType, ResponseType } from "./effectConfig";

export type CoercedResponseType<
  T extends type.Any,
  C extends { stream: boolean },
> = {
  kind: "response";
  type: T;
  config: C;
};
type CoercedParamsType<T extends type.Any, C extends { decode: boolean }> = {
  kind: "params";
  type: T;
  config: C;
};

type AnyResponseType = ResponseType<type.Any, { stream?: boolean }>;
type AnyCoercedResponseType = CoercedResponseType<
  type.Any,
  { stream: boolean }
>;
type AnyParamsType = ParamsType<type.Any, { decode?: boolean }>;
type AnyCoercedParamsType = CoercedParamsType<type.Any, { decode: boolean }>;

export type EventHandlerTypeConfigIn<
  Response extends AnyResponseType = AnyResponseType,
  Q extends AnyParamsType | undefined = undefined,
  B extends AnyParamsType | undefined = undefined,
  R extends AnyParamsType | undefined = undefined,
> = {
  response: Response;
  query?: Q;
  body?: B;
  router?: R;
};

export type EventHandlerTypeConfig<
  Response extends AnyCoercedResponseType = AnyCoercedResponseType,
  Q extends AnyCoercedParamsType | undefined = AnyCoercedParamsType | undefined,
  B extends AnyCoercedParamsType | undefined = AnyCoercedParamsType | undefined,
  R extends AnyCoercedParamsType | undefined = AnyCoercedParamsType | undefined,
> = {
  response: Response;
  query: Q;
  body: B;
  router: R;
};

export type EventHandlerConfigIn<
  Name extends string,
  Response extends AnyResponseType = AnyResponseType,
  Q extends AnyParamsType | undefined = undefined,
  B extends AnyParamsType | undefined = undefined,
  R extends AnyParamsType | undefined = undefined,
> = {
  name: Name;
  response: Response;
  query?: Q;
  body?: B;
  router?: R;
};

export type EventHandlerConfig<
  Name extends string,
  Response extends AnyCoercedResponseType = AnyCoercedResponseType,
  Q extends AnyCoercedParamsType | undefined = AnyCoercedParamsType | undefined,
  B extends AnyCoercedParamsType | undefined = AnyCoercedParamsType | undefined,
  R extends AnyCoercedParamsType | undefined = AnyCoercedParamsType | undefined,
> = {
  name: Name;
  response: Response;
  query: Q;
  body: B;
  router: R;
};

export type EventHandlerResponseValidatorType<
  C extends EventHandlerTypeConfig,
> = C["response"]["type"];
export type EventHandlerQueryValidatorType<C extends EventHandlerTypeConfig> =
  C["query"] extends infer Q
    ? Q extends AnyCoercedParamsType
      ? Q["type"]
      : undefined
    : undefined;
export type EventHandlerBodyValidatorType<C extends EventHandlerTypeConfig> =
  C["body"] extends infer B
    ? B extends AnyCoercedParamsType
      ? B["type"]
      : undefined
    : undefined;
export type EventHandlerRouterValidatorType<C extends EventHandlerTypeConfig> =
  C["router"] extends infer R
    ? R extends AnyCoercedParamsType
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
  Simplify<EventHandlerClientResponseType<C>>;
export type EventHandlerQueryType<C extends EventHandlerTypeConfig> = Simplify<
  C["query"] extends infer Q
    ? Q extends AnyCoercedParamsType
      ? Q["config"]["decode"] extends true
        ? EventHandlerClientQueryType<C>
        : never
      : never
    : never
>;
export type EventHandlerBodyType<C extends EventHandlerTypeConfig> = Simplify<
  C["body"] extends infer B
    ? B extends AnyCoercedParamsType
      ? B["config"]["decode"] extends true
        ? EventHandlerClientBodyType<C>
        : never
      : never
    : never
>;
export type EventHandlerRouterType<C extends EventHandlerTypeConfig> = Simplify<
  C["router"] extends infer R
    ? R extends AnyCoercedParamsType
      ? R["config"]["decode"] extends true
        ? EventHandlerClientRouterType<C>
        : never
      : never
    : never
>;

export type EventHandlerResponseConfig<C extends EventHandlerTypeConfig> =
  Simplify<C["response"]["config"]>;
export type EventHandlerQueryConfig<C extends EventHandlerTypeConfig> =
  Simplify<
    C["query"] extends infer Q
      ? Q extends AnyCoercedParamsType
        ? Q["config"]
        : undefined
      : undefined
  >;
export type EventHandlerBodyConfig<C extends EventHandlerTypeConfig> = Simplify<
  C["body"] extends infer B
    ? B extends AnyCoercedParamsType
      ? B["config"]
      : undefined
    : undefined
>;
export type EventHandlerRouterConfig<C extends EventHandlerTypeConfig> =
  Simplify<
    C["router"] extends infer R
      ? R extends AnyCoercedParamsType
        ? R["config"]
        : undefined
      : undefined
  >;

type ToCoercedResponseType<T extends AnyResponseType> = Simplify<
  CoercedResponseType<
    T["type"],
    {
      stream: NonNullable<NonNullable<T["config"]>["stream"]> extends true
        ? true
        : false;
    }
  >
>;

type ToCoercedParamsType<T extends AnyParamsType | undefined> = [T] extends [
  AnyParamsType,
]
  ? Simplify<
      CoercedParamsType<
        T["type"],
        {
          decode: NonNullable<NonNullable<T["config"]>["decode"]> extends false
            ? false
            : true;
        }
      >
    >
  : undefined;

/*@__NO_SIDE_EFFECTS__*/
export const defineEventHandlerConfig = <
  Name extends string,
  Response extends AnyResponseType,
  Q extends AnyParamsType | undefined = undefined,
  B extends AnyParamsType | undefined = undefined,
  R extends AnyParamsType | undefined = undefined,
>({
  name,
  response,
  query,
  body,
  router,
}: EventHandlerConfigIn<Name, Response, Q, B, R>): EventHandlerConfig<
  Name,
  ToCoercedResponseType<Response>,
  ToCoercedParamsType<Q>,
  ToCoercedParamsType<B>,
  ToCoercedParamsType<R>
> => {
  return {
    name,
    response: {
      kind: "response",
      type: response.type,
      config: { stream: response.config?.stream ?? false },
    } as ToCoercedResponseType<Response>,
    query: query
      ? ({
          kind: "params",
          type: query.type,
          config: { decode: query.config?.decode ?? true },
        } as ToCoercedParamsType<Q>)
      : (undefined as ToCoercedParamsType<Q>),
    body: body
      ? ({
          kind: "params",
          type: body.type,
          config: { decode: body.config?.decode ?? true },
        } as ToCoercedParamsType<B>)
      : (undefined as ToCoercedParamsType<B>),
    router: router
      ? ({
          kind: "params",
          type: router.type,
          config: { decode: router.config?.decode ?? true },
        } as ToCoercedParamsType<R>)
      : (undefined as ToCoercedParamsType<R>),
  };
};
