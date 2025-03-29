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

export type AnyResponseType = ResponseType<type.Any, { stream?: boolean }>;
export type AnyCoercedResponseType = CoercedResponseType<
  type.Any,
  { stream: boolean }
>;
export type AnyParamsType = ParamsType<type.Any, { decode?: boolean }>;
export type AnyCoercedParamsType = CoercedParamsType<
  type.Any,
  { decode: boolean }
>;

export type FetchTypeConfigIn<
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

export type FetchTypeConfig<
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

export type FetchResponseValidatorType<C extends FetchTypeConfig> =
  C["response"]["type"];
export type FetchQueryValidatorType<C extends FetchTypeConfig> =
  C["query"] extends infer Q
    ? Q extends AnyCoercedParamsType
      ? Q["type"]
      : undefined
    : undefined;
export type FetchBodyValidatorType<C extends FetchTypeConfig> =
  C["body"] extends infer B
    ? B extends AnyCoercedParamsType
      ? B["type"]
      : undefined
    : undefined;
export type FetchRouterValidatorType<C extends FetchTypeConfig> =
  C["router"] extends infer R
    ? R extends AnyCoercedParamsType
      ? R["type"]
      : undefined
    : undefined;

export type FetchResponseType<C extends FetchTypeConfig> =
  FetchResponseValidatorType<C>["infer"];
export type FetchQueryType<C extends FetchTypeConfig> =
  FetchQueryValidatorType<C> extends type.Any
    ? FetchQueryValidatorType<C>["infer"]
    : never;
export type FetchBodyType<C extends FetchTypeConfig> =
  FetchBodyValidatorType<C> extends type.Any
    ? FetchBodyValidatorType<C>["infer"]
    : never;
export type FetchRouterType<C extends FetchTypeConfig> =
  FetchRouterValidatorType<C> extends type.Any
    ? FetchRouterValidatorType<C>["infer"]
    : never;

export type FetchResponseConfig<C extends FetchTypeConfig> = Simplify<
  C["response"]["config"]
>;
export type FetchQueryConfig<C extends FetchTypeConfig> = Simplify<
  C["query"] extends infer Q
    ? Q extends AnyCoercedParamsType
      ? Q["config"]
      : undefined
    : undefined
>;
export type FetchBodyConfig<C extends FetchTypeConfig> = Simplify<
  C["body"] extends infer B
    ? B extends AnyCoercedParamsType
      ? B["config"]
      : undefined
    : undefined
>;
export type FetchRouterConfig<C extends FetchTypeConfig> = Simplify<
  C["router"] extends infer R
    ? R extends AnyCoercedParamsType
      ? R["config"]
      : undefined
    : undefined
>;

export type ToCoercedResponseType<T extends AnyResponseType> = Simplify<
  CoercedResponseType<
    T["type"],
    {
      stream: NonNullable<NonNullable<T["config"]>["stream"]> extends true
        ? true
        : false;
    }
  >
>;

export type ToCoercedParamsType<T extends AnyParamsType | undefined> = [
  T,
] extends [AnyParamsType]
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
export const defineFetchConfig = <
  Response extends AnyResponseType,
  Q extends AnyParamsType | undefined = undefined,
  B extends AnyParamsType | undefined = undefined,
  R extends AnyParamsType | undefined = undefined,
>({
  response,
  query,
  body,
  router,
}: FetchTypeConfigIn<Response, Q, B, R>): FetchTypeConfig<
  ToCoercedResponseType<Response>,
  ToCoercedParamsType<Q>,
  ToCoercedParamsType<B>,
  ToCoercedParamsType<R>
> => {
  return {
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
