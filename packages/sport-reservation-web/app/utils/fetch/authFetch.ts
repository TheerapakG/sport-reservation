import { apiRoutes } from "api";
import { Type } from "arktype";
import { Context, Effect } from "effect";
import { ofetch } from "ofetch";
import { addRoute, createRouter } from "rou3";
import { config } from "../config";
import { Fetch, Router, provideTypedNitroFetch, withMock } from "./shared";

export const createAuthFetch = async () =>
  ofetch.create({ baseURL: config.authBaseUrl });
export const createAuthRouter = async () => {
  const authRouter = createRouter<Type[]>();
  Object.entries(await apiRoutes["auth"]()).forEach(([route, methodPath]) =>
    Object.entries(methodPath).forEach(([method, path]) =>
      addRoute(authRouter, method, route, path as readonly Type[]),
    ),
  );
  return authRouter;
};

const authContext = Effect.gen(function* () {
  const authFetch = yield* Effect.tryPromise(createAuthFetch);
  const authRouter = yield* Effect.tryPromise(createAuthRouter);
  return Context.empty().pipe(
    Context.add(Fetch, { fetch: authFetch }),
    Context.add(Router, { router: authRouter }),
  );
});

export const authGetGenerateLineLoginRequest = withMock(
  (_opts: Record<string, never>) => {
    return provideTypedNitroFetch(
      authContext,
      "auth",
      "/login/line/generateRequest",
      {
        method: "GET",
      },
    );
  },
);

export const authPostGetLineLoginAuthToken = withMock(
  ({ code, state }: { code: string; state: string }) => {
    return provideTypedNitroFetch(
      authContext,
      "auth",
      "/login/line/getAuthToken",
      {
        method: "POST",
        body: { code, state },
      },
    );
  },
);
