import { Simplify } from "effect/Types";
import { unknownType } from "./type";

export type EventHandlerTypeConfigIn<
  Response extends typeof unknownType = typeof unknownType,
  Q extends typeof unknownType | undefined = undefined,
  B extends typeof unknownType | undefined = undefined,
  R extends typeof unknownType | undefined = undefined,
> = {
  response: Response;
  query?: Q;
  body?: B;
  router?: R;
};

export type EventHandlerTypeConfig<
  Response extends typeof unknownType = typeof unknownType,
  Q extends typeof unknownType | undefined = typeof unknownType | undefined,
  B extends typeof unknownType | undefined = typeof unknownType | undefined,
  R extends typeof unknownType | undefined = typeof unknownType | undefined,
> = {
  response: Response;
  query: Q;
  body: B;
  router: R;
};

export type EventHandlerConfigIn<
  Name extends string,
  Response extends typeof unknownType = typeof unknownType,
  Q extends typeof unknownType | undefined = typeof unknownType | undefined,
  B extends typeof unknownType | undefined = typeof unknownType | undefined,
  R extends typeof unknownType | undefined = typeof unknownType | undefined,
> = Simplify<
  {
    name: Name;
  } & EventHandlerTypeConfigIn<Response, Q, B, R>
>;

export type EventHandlerConfig<
  Name extends string,
  Response extends typeof unknownType = typeof unknownType,
  Q extends typeof unknownType | undefined = typeof unknownType | undefined,
  B extends typeof unknownType | undefined = typeof unknownType | undefined,
  R extends typeof unknownType | undefined = typeof unknownType | undefined,
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
  EventHandlerQuery<C> extends typeof unknownType
    ? EventHandlerQuery<C>["infer"]
    : never;
export type EventHandlerBodyType<C extends EventHandlerTypeConfig> =
  EventHandlerBody<C> extends typeof unknownType
    ? EventHandlerBody<C>["infer"]
    : never;
export type EventHandlerRouterType<C extends EventHandlerTypeConfig> =
  EventHandlerRouter<C> extends typeof unknownType
    ? EventHandlerRouter<C>["infer"]
    : never;

/*@__NO_SIDE_EFFECTS__*/
export const defineEventHandlerConfig = <
  Name extends string,
  Response extends typeof unknownType,
  Q extends typeof unknownType | undefined = undefined,
  B extends typeof unknownType | undefined = undefined,
  R extends typeof unknownType | undefined = undefined,
>({
  name,
  response,
  query,
  body,
  router,
}: EventHandlerConfigIn<Name, Response, Q, B, R>): EventHandlerConfig<
  Name,
  Response,
  [Q] extends [typeof unknownType] ? Q : undefined,
  [B] extends [typeof unknownType] ? B : undefined,
  [R] extends [typeof unknownType] ? R : undefined
> => {
  return {
    name,
    response,
    query: query as [Q] extends [typeof unknownType] ? Q : undefined,
    body: body as [B] extends [typeof unknownType] ? B : undefined,
    router: router as [R] extends [typeof unknownType] ? R : undefined,
  };
};
