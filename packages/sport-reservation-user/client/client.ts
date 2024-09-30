import { Context } from "effect";
import {
  Client,
  createClient,
  createFetch,
} from "sport-reservation-common/client/client";
import { Fetch } from "sport-reservation-common/utils/fetch";
import { apiRoutes } from "./routes.gen";

export { Fetch as UserFetch };

export const createUserFetch = createFetch;

export class UserClient extends Context.Tag("UserClient")<
  UserClient,
  Client<typeof apiRoutes>
>() {}

export const userClient = createClient(UserClient, apiRoutes);
