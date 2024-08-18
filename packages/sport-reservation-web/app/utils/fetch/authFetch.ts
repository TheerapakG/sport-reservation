import { Cause, Effect } from "effect";
import { ofetch } from "ofetch";
import { z } from "zod";
import { config } from "../config";
import { Fetch, typedFetch, withMock } from "./shared";

export const authFetch = ofetch.create({ baseURL: config.authBaseUrl });

const authGetResult = z.string();
export const authGet = withMock((opts?: Record<string, never>) => {
  return Effect.provideService(
    typedFetch(authGetResult, "/", { method: "GET" }),
    Fetch,
    { fetch: Effect.succeed(authFetch) },
  );
});
