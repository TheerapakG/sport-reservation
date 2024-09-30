import { Simplify } from "effect/Types";
import { type } from "arktype";

export type EventHandlerTypeConfigIn<
  Response extends type.Any = type.Any,
  Q extends type.Any | undefined = undefined,
  B extends type.Any | undefined = undefined,
  R extends type.Any | undefined = undefined,
> = {
  response: Response;
  query?: Q;
  body?: B;
  router?: R;
};

export type EventHandlerTypeConfig<
  Response extends type.Any = type.Any,
  Q extends type.Any | undefined = type.Any | undefined,
  B extends type.Any | undefined = type.Any | undefined,
  R extends type.Any | undefined = type.Any | undefined,
> = {
  response: Response;
  query: Q;
  body: B;
  router: R;
};

export type EventHandlerConfigIn<
  Name extends string,
  Response extends type.Any = type.Any,
  Q extends type.Any | undefined = type.Any | undefined,
  B extends type.Any | undefined = type.Any | undefined,
  R extends type.Any | undefined = type.Any | undefined,
> = Simplify<
  {
    name: Name;
  } & EventHandlerTypeConfigIn<Response, Q, B, R>
>;

export type EventHandlerConfig<
  Name extends string,
  Response extends type.Any = type.Any,
  Q extends type.Any | undefined = type.Any | undefined,
  B extends type.Any | undefined = type.Any | undefined,
  R extends type.Any | undefined = type.Any | undefined,
> = Simplify<
  {
    name: Name;
  } & EventHandlerTypeConfig<Response, Q, B, R>
>;

export type EventHandlerResponse<C extends EventHandlerTypeConfig> =
  C["response"];
export type EventHandlerQuery<C extends EventHandlerTypeConfig> = C["query"];
export type EventHandlerBody<C extends EventHandlerTypeConfig> = C["body"];
export type EventHandlerRouter<C extends EventHandlerTypeConfig> = C["router"];

export type EventHandlerResponseType<C extends EventHandlerTypeConfig> =
  EventHandlerResponse<C>["infer"];
export type EventHandlerQueryType<C extends EventHandlerTypeConfig> =
  EventHandlerQuery<C> extends type.Any ? EventHandlerQuery<C>["infer"] : never;
export type EventHandlerBodyType<C extends EventHandlerTypeConfig> =
  EventHandlerBody<C> extends type.Any ? EventHandlerBody<C>["infer"] : never;
export type EventHandlerRouterType<C extends EventHandlerTypeConfig> =
  EventHandlerRouter<C> extends type.Any
    ? EventHandlerRouter<C>["infer"]
    : never;

/*@__NO_SIDE_EFFECTS__*/
export const defineEventHandlerConfig = <
  Name extends string,
  Response extends type.Any,
  Q extends type.Any | undefined = undefined,
  B extends type.Any | undefined = undefined,
  R extends type.Any | undefined = undefined,
>({
  name,
  response,
  query,
  body,
  router,
}: EventHandlerConfigIn<Name, Response, Q, B, R>): EventHandlerConfig<
  Name,
  Response,
  [Q] extends [type.Any] ? Q : undefined,
  [B] extends [type.Any] ? B : undefined,
  [R] extends [type.Any] ? R : undefined
> => {
  return {
    name,
    response,
    query: query as [Q] extends [type.Any] ? Q : undefined,
    body: body as [B] extends [type.Any] ? B : undefined,
    router: router as [R] extends [type.Any] ? R : undefined,
  };
};
