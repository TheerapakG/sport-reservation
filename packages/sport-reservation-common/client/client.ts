import { Type } from "arktype";
import { Context, Effect } from "effect";
import { ResponseType, ofetch } from "ofetch";
import { ArktypeError, FetchError } from "~~/models/errors";
import { Fetch, typedFetch, withMock } from "~~/utils/fetch";

export { Fetch };

/*@__NO_SIDE_EFFECTS__*/
export const createFetch = ({ baseURL }: { baseURL: string }) =>
  ofetch.create({ baseURL });

type ClientRoutes = {
  [method: string]: {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    type: Type<unknown, {}>;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    queryParams: Type<unknown, {}>;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    routerParams: Type<unknown, {}>;
    path: string;
    method: string;
  };
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type InferQueryParams<QP extends Type<unknown, {}>> =
  QP["infer"] extends Record<string, unknown>
    ? {
        query: QP["infer"];
      }
    : {
        query?: Record<string, unknown>;
      };

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type InferRouterParams<RP extends Type<unknown, {}>> =
  RP["infer"] extends Record<string, unknown>
    ? {
        router: RP["infer"];
      }
    : {
        router?: Record<string, unknown>;
      };

type Method<
  Opts extends Record<string, unknown> = Record<string, unknown>,
  A = unknown,
  E = FetchError | ArktypeError,
  R = never,
> = (
  opts: Opts & {
    mock?: Effect.Effect<A, E, never>;
  }
) => Effect.Effect<A, E, R>;

/*@__NO_SIDE_EFFECTS__*/
const createMethod = <
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  QP extends Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  RP extends Type<unknown, {}>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  T extends Type<unknown, {}>,
  R extends ResponseType = "json",
>({
  fetch,
  type,
  queryParams,
  routerParams,
  path,
  method,
}: {
  fetch: Context.Tag.Service<Fetch>;
  type: T;
  queryParams: QP;
  routerParams: RP;
  path: string;
  method: string;
}): Method<InferQueryParams<QP> & InferRouterParams<RP>, typeof type.infer> =>
  withMock(({ query, router }) =>
    Effect.provideService(
      typedFetch<T, QP, RP, R>(
        { response: type, queryParams, routerParams },
        path,
        {
          method,
          query,
          router,
        }
      ),
      Fetch,
      fetch
    )
  );

/*@__NO_SIDE_EFFECTS__*/
export const createClient = <CR extends ClientRoutes>(clientRoutes: CR) => {
  return Effect.gen(function* () {
    const fetch = yield* Fetch;
    return Object.fromEntries(
      Object.entries(clientRoutes).map(
        ([name, { type, queryParams, routerParams, path, method }]) => [
          name,
          createMethod({
            fetch,
            type,
            queryParams,
            routerParams,
            path,
            method,
          }) as Method<
            InferQueryParams<typeof queryParams> &
              InferRouterParams<typeof routerParams>,
            typeof type.infer
          >,
        ]
      )
    ) as unknown as {
      [K in keyof typeof clientRoutes]: Method<
        InferQueryParams<(typeof clientRoutes)[K]["queryParams"]> &
          InferRouterParams<(typeof clientRoutes)[K]["routerParams"]>,
        (typeof clientRoutes)[K]["type"]["infer"]
      >;
    };
  });
};
