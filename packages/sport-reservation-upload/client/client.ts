import { Context } from "effect";
import {
  Client,
  createClient,
  createFetch,
} from "sport-reservation-common/client/client";
import { Fetch } from "sport-reservation-common/utils/fetch";
import { apiRoutes } from "./routes.gen";

export { Fetch as UploadFetch };

export const createUploadFetch = createFetch;

export class UploadClient extends Context.Tag("UploadClient")<
  UploadClient,
  Client<typeof apiRoutes>
>() {}

export const uploadClient = createClient(UploadClient, apiRoutes);
