import { apiRoutes } from "api";
import { Type } from "arktype";
import { Context, Effect } from "effect";
import { ofetch } from "ofetch";
import { addRoute, createRouter } from "rou3";
import { config } from "../config";
import { Fetch, Router, typedNitroFetch, withMock } from "./shared";

export const authFetch = ofetch.create({ baseURL: config.authBaseUrl });
export const authRouter = createRouter<Type[]>();
Object.entries(apiRoutes["auth"]).forEach(([route, methodPath]) =>
  Object.entries(methodPath).forEach(([method, path]) =>
    addRoute(authRouter, method, route, path),
  ),
);

const authContext = Context.empty().pipe(
  Context.add(Fetch, { fetch: authFetch }),
  Context.add(Router, { router: authRouter }),
);

export const authGetGenerateLineLoginRequest = withMock(
  (_opts: Record<string, never>) => {
    return Effect.provide(
      typedNitroFetch("auth", "/login/line/generateRequest", {
        method: "GET",
      }),
      authContext,
    );
  },
);

export const authPostGetLineLoginAuthToken = withMock(
  ({ code, state }: { code: string; state: string }) => {
    return Effect.provide(
      typedNitroFetch("auth", "/login/line/getAuthToken", {
        method: "POST",
        body: { code, state },
      }),
      authContext,
    );
  },
);
