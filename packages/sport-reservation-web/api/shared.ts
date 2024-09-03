import { RouterMethod } from "h3";
import { FetchOptions } from "ofetch";

type NitroApi = Record<
  string,
  Partial<Record<RouterMethod | "default", unknown>>
>;
type MatchResult<
  Key extends string,
  Exact extends boolean = false,
  Score extends unknown[] = [],
  catchAll extends boolean = false,
> = {
  [k in Key]: {
    key: k;
    exact: Exact;
    score: Score;
    catchAll: catchAll;
  };
}[Key];
type Subtract<
  Minuend extends unknown[] = [],
  Subtrahend extends unknown[] = [],
> = Minuend extends [...Subtrahend, ...infer Remainder] ? Remainder : never;
type TupleIfDiff<
  First extends string,
  Second extends string,
  Tuple extends unknown[] = [],
> = First extends `${Second}${infer Diff}`
  ? Diff extends ""
    ? []
    : Tuple
  : [];
type MaxTuple<N extends unknown[] = [], T extends unknown[] = []> = {
  current: T;
  result: MaxTuple<N, ["", ...T]>;
}[[N["length"]] extends [Partial<T>["length"]] ? "current" : "result"];
type CalcMatchScore<
  Key extends string,
  Route extends string,
  Score extends unknown[] = [],
  Init extends boolean = false,
  FirstKeySegMatcher extends string = Init extends true ? ":Invalid:" : "",
> = `${Key}/` extends `${infer KeySeg}/${infer KeyRest}`
  ? KeySeg extends FirstKeySegMatcher
    ? Subtract<
        [...Score, ...TupleIfDiff<Route, Key, ["", ""]>],
        TupleIfDiff<Key, Route, ["", ""]>
      >
    : `${Route}/` extends `${infer RouteSeg}/${infer RouteRest}`
      ? `${RouteSeg}?` extends `${infer RouteSegWithoutQuery}?${string}`
        ? RouteSegWithoutQuery extends KeySeg
          ? CalcMatchScore<KeyRest, RouteRest, [...Score, "", ""]>
          : KeySeg extends `:${string}`
            ? RouteSegWithoutQuery extends ""
              ? never
              : CalcMatchScore<KeyRest, RouteRest, [...Score, ""]>
            : KeySeg extends RouteSegWithoutQuery
              ? CalcMatchScore<KeyRest, RouteRest, [...Score, ""]>
              : never
        : never
      : never
  : never;
type _MatchedRoutes<
  Api extends NitroApi,
  Route extends string,
  MatchedResultUnion extends MatchResult<string> = MatchResult<
    keyof Api & string
  >,
> = MatchedResultUnion["key"] extends infer MatchedKeys
  ? MatchedKeys extends string
    ? Route extends MatchedKeys
      ? MatchResult<MatchedKeys, true>
      : MatchedKeys extends `${infer Root}/**${string}`
        ? MatchedKeys extends `${string}/**`
          ? Route extends `${Root}/${string}`
            ? MatchResult<MatchedKeys, false, [], true>
            : never
          : MatchResult<
              MatchedKeys,
              false,
              CalcMatchScore<Root, Route, [], true>
            >
        : MatchResult<
            MatchedKeys,
            false,
            CalcMatchScore<MatchedKeys, Route, [], true>
          >
    : never
  : never;
type MatchedRoutes<
  Api extends NitroApi,
  Route extends string,
  MatchedKeysResult extends MatchResult<string> = MatchResult<
    keyof Api & string
  >,
  Matches extends MatchResult<string> = _MatchedRoutes<
    Api,
    Route,
    MatchedKeysResult
  >,
> = Route extends "/"
  ? keyof Api
  : Extract<
        Matches,
        {
          exact: true;
        }
      > extends never
    ?
        | Extract<
            Exclude<
              Matches,
              {
                score: never;
              }
            >,
            {
              score: MaxTuple<Matches["score"]>;
            }
          >["key"]
        | Extract<
            Matches,
            {
              catchAll: true;
            }
          >["key"]
    : Extract<
        Matches,
        {
          exact: true;
        }
      >["key"];
export type NitroFetchRequest<Api extends NitroApi> =
  | (Exclude<keyof Api, `/_${string}` | `/api/_${string}`> & string)
  | (string & {});
export type MiddlewareOf<
  Api extends NitroApi,
  Route extends string,
  Method extends RouterMethod | "default",
> = Method extends keyof Api[MatchedRoutes<Api, Route>]
  ? Api[MatchedRoutes<Api, Route>][Method]
  : never;
export type TypedResponse<
  Api extends NitroApi,
  Route,
  Default = unknown,
  Method extends RouterMethod = RouterMethod,
> = Default extends string | boolean | number | null | void | object
  ? Default
  : Route extends string
    ? MiddlewareOf<Api, Route, Method> extends never
      ? MiddlewareOf<Api, Route, "default"> extends never
        ? Default
        : MiddlewareOf<Api, Route, "default">
      : MiddlewareOf<Api, Route, Method>
    : Default;
type AvailableRouterMethod<
  Api extends NitroApi,
  R extends NitroFetchRequest<Api>,
> = R extends string
  ? keyof Api[MatchedRoutes<Api, R>] extends undefined
    ? RouterMethod
    : Extract<keyof Api[MatchedRoutes<Api, R>], "default"> extends undefined
      ? Extract<RouterMethod, keyof Api[MatchedRoutes<Api, R>]>
      : RouterMethod
  : RouterMethod;
export interface NitroFetchOptions<
  Api extends NitroApi,
  R extends NitroFetchRequest<Api>,
  M extends AvailableRouterMethod<Api, R> = AvailableRouterMethod<Api, R>,
> extends FetchOptions {
  method?: Uppercase<M> | M;
}
export type ExtractedRouteMethod<
  Api extends NitroApi,
  R extends NitroFetchRequest<Api>,
  O extends NitroFetchOptions<Api, R>,
> = O extends undefined
  ? "get"
  : O["method"] extends infer M
    ? M extends string
      ? Lowercase<M> extends RouterMethod
        ? Lowercase<M>
        : "get"
      : "get"
    : never;
