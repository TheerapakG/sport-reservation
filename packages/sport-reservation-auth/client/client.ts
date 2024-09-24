import {
  createFetch,
  createClient,
  Client,
} from "sport-reservation-common/server/client";
import { Fetch } from "sport-reservation-common/utils/fetch";
import { apiRoutes } from "./routes.gen";
import { Context } from "effect";

export { Fetch as AuthFetch };

export const createAuthFetch = createFetch;

export class AuthClient extends Context.Tag("AuthClient")<
  AuthClient,
  Client<typeof apiRoutes>
>() {}

export const authClient = createClient(AuthClient, apiRoutes);
