import { type } from "arktype";
import { eventType } from "~/models/event";

export const scheduleType = type({
  schedule: {
    id: "string",
    startAt: "string",
    endAt: "string",
    repeat: "number",
    repeatInterval: "number",
  },
  event: eventType,
});

export const scheduleInstanceType = type({
  schedule: scheduleType,
  participants: {
    repeatIndex: "number",
    participants: "number",
  },
});
