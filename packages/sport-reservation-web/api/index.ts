import { authApiRoutes, AuthApiTypes } from "sport-reservation-auth";

export type ApiTypes = {
  auth: AuthApiTypes;
};

export const apiRoutes = {
  auth: authApiRoutes,
};
