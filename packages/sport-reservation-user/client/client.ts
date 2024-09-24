import {
  createFetch,
  createClient,
  Client,
} from "sport-reservation-common/server/client";
import { Fetch } from "sport-reservation-common/utils/fetch";
import { apiRoutes } from "./routes.gen";
import { Context } from "effect";

export { Fetch as UserFetch };

export const createUserFetch = createFetch;

export class UserClient extends Context.Tag("UserClient")<
  UserClient,
  Client<typeof apiRoutes>
>() {}

export const userClient = createClient(UserClient, apiRoutes);
