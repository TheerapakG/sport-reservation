import { Layer } from "effect";
import {
  authClient as _authClient,
  AuthFetch,
  createAuthFetch,
} from "sport-reservation-auth/client";
import { config } from "../config";

export const authClient = _authClient.pipe(
  Layer.provide(
    Layer.succeed(AuthFetch, {
      fetch: createAuthFetch({ baseURL: config.authBaseUrl }),
    }),
  ),
);
