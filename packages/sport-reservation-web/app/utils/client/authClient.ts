import {
  AuthFetch,
  createAuthFetch,
  authClient as _authClient,
} from "sport-reservation-auth";
import { config } from "../config";
import { Layer } from "effect";

export const authClient = _authClient.pipe(
  Layer.provide(
    Layer.succeed(AuthFetch, {
      fetch: createAuthFetch({ baseURL: config.authBaseUrl }),
    }),
  ),
);
