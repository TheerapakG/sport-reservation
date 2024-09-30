import { Context } from "effect";
import {
  Client,
  createClient,
  createFetch,
} from "sport-reservation-common/client/client";
import { Fetch } from "sport-reservation-common/utils/fetch";
import { apiRoutes } from "./routes.gen";

export { Fetch as AuthFetch };

export const createAuthFetch = createFetch;

export class AuthClient extends Context.Tag("AuthClient")<
  AuthClient,
  Client<typeof apiRoutes>
>() {}

export const authClient = createClient(AuthClient, apiRoutes);
