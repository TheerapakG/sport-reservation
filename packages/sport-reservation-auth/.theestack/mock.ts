import { createMockClient } from "sport-reservation-common/client/client";
import { AuthClient } from "./client";
import { apiRoutes } from "./routes.gen";

export const createMockAuthClient= () =>
  createMockClient(AuthClient, apiRoutes);