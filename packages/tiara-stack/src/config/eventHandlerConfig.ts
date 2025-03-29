import {
  AnyCoercedParamsType,
  AnyCoercedResponseType,
  AnyParamsType,
  AnyResponseType,
  FetchTypeConfig,
  FetchTypeConfigIn,
  ToCoercedParamsType,
  ToCoercedResponseType,
} from "./fetchConfig";

export type EventHandlerConfigIn<
  Name extends string,
  Response extends AnyResponseType = AnyResponseType,
  Q extends AnyParamsType | undefined = undefined,
  B extends AnyParamsType | undefined = undefined,
  R extends AnyParamsType | undefined = undefined,
> = {
  name: Name;
} & FetchTypeConfigIn<Response, Q, B, R>;

export type EventHandlerConfig<
  Name extends string,
  Response extends AnyCoercedResponseType = AnyCoercedResponseType,
  Q extends AnyCoercedParamsType | undefined = AnyCoercedParamsType | undefined,
  B extends AnyCoercedParamsType | undefined = AnyCoercedParamsType | undefined,
  R extends AnyCoercedParamsType | undefined = AnyCoercedParamsType | undefined,
> = {
  name: Name;
} & FetchTypeConfig<Response, Q, B, R>;

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
