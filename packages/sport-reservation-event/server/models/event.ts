import { type } from "arktype";
import { clubType } from "sport-reservation-club/models";
import { userProfile } from "sport-reservation-user/models";

export const eventType = type({
  eventId: "string",
  "name?": "string",
  "image?": "string",
  "description?": "string",
  "location?": ["number", "number"],
  "locationDescription?": "string",
  autoAccept: "boolean",
  sizeLimit: "number",
  skillLevel: "('beginner' | 'intermediate' | 'advanced')[]",
  sportType: "('badminton' | 'tennis' | 'running')[]",
}).and([
  {
    eventCreatorType: "'user'",
    creator: [userProfile, "|", "undefined"],
  },
  "|",
  {
    eventCreatorType: "'club'",
    creator: [clubType, "|", "undefined"],
  },
]);
