import {
  createFetch,
  createClient,
  Client,
} from "sport-reservation-common/server/client";
import { Fetch } from "sport-reservation-common/utils/fetch";
import { apiRoutes } from "./routes.gen";
import { Context } from "effect";

export { Fetch as UploadFetch };

export const createUploadFetch = createFetch;

export class UploadClient extends Context.Tag("UploadClient")<
  UploadClient,
  Client<typeof apiRoutes>
>() {}

export const uploadClient = createClient(UploadClient, apiRoutes);
