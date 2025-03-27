import { type } from "arktype";

export const clubType = type({
  id: "string",
  creatorId: "string",
  "name?": "string",
  "image?": "string",
  "description?": "string",
  "location?": ["number", "number"],
  "locationDescription?": "string",
});
