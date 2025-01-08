import { createMockClient } from "sport-reservation-common/client/client";
import { UserClient } from "./client";
import { apiRoutes } from "./routes.gen";

export const createMockUserClient= () =>
  createMockClient(UserClient, apiRoutes);