import { unknownType } from "./type";

export type EventHandlerConfigIn<
  Name extends string,
  Response extends typeof unknownType = typeof unknownType,
  Q extends typeof unknownType | undefined = undefined,
  B extends typeof unknownType | undefined = undefined,
  R extends typeof unknownType | undefined = undefined,
> = {
  name: Name;
  response: Response;
  query?: Q;
  body?: B;
  router?: R;
};

export type EventHandlerConfig<
  Name extends string,
  Response extends typeof unknownType = typeof unknownType,
  Q extends typeof unknownType = typeof unknownType,
  B extends typeof unknownType = typeof unknownType,
  R extends typeof unknownType = typeof unknownType,
> = {
  name: Name;
  response: Response;
  query: Q;
  body: B;
  router: R;
};

/*@__NO_SIDE_EFFECTS__*/
export const defineEventHandlerConfig = <
  Name extends string,
  Response extends typeof unknownType,
  Q extends typeof unknownType | undefined,
  B extends typeof unknownType | undefined,
  R extends typeof unknownType | undefined,
>({
  name,
  response,
  query,
  body,
  router,
}: EventHandlerConfigIn<Name, Response, Q, B, R>): EventHandlerConfig<
  Name,
  Response,
  Q extends undefined ? typeof unknownType : Q,
  B extends undefined ? typeof unknownType : B,
  R extends undefined ? typeof unknownType : R
> => {
  return {
    name,
    response,
    query: (query ?? unknownType) as Q extends undefined
      ? typeof unknownType
      : Q,
    body: (body ?? unknownType) as B extends undefined ? typeof unknownType : B,
    router: (router ?? unknownType) as R extends undefined
      ? typeof unknownType
      : R,
  };
};
