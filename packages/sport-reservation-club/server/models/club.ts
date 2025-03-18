import { type } from "arktype";

export const club = type({
  id: "string",
  groupId: "string",
  name: "string",
  "description?": "string",
  "locationLatitude?": "number",
  "locationLongitude?": "number",
  "locationDescription?": "string",
});

export type Club = typeof club.infer;
