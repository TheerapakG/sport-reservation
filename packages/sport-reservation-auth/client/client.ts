import {
  createFetch,
  createClient,
} from "sport-reservation-common/client/client";
import { Fetch } from "sport-reservation-common/utils/fetch";
import { authApiRoutes } from "./routes.gen";

export { Fetch as AuthFetch };

export const createAuthFetch = createFetch;

/*@__NO_SIDE_EFFECTS__*/
export const createAuthClient = () => {
  return createClient(authApiRoutes);
};
