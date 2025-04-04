import { type } from "arktype";
import { userProfile } from "sport-reservation-user/models";

export const clubType = type({
  id: "string",
  creator: userProfile,
  "name?": "string",
  "image?": "string",
  "description?": "string",
  "location?": ["number", "number"],
  "locationDescription?": "string",
  size: "number",
});
