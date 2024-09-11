import {
  AuthFetch,
  createAuthFetch,
  createAuthClient,
} from "sport-reservation-auth";
import { config } from "../config";
import { Effect } from "effect";

export const authClient = Effect.provideService(createAuthClient(), AuthFetch, {
  fetch: createAuthFetch({ baseURL: config.authBaseUrl }),
});
