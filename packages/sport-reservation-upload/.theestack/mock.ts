import { createMockClient } from "sport-reservation-common/client/client";
import { UploadClient } from "./client";
import { apiRoutes } from "./routes.gen";

export const createMockUploadClient= () =>
  createMockClient(UploadClient, apiRoutes);