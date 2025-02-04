import { type } from "arktype";

export const userProfileCreate = /*@__PURE__*/ type({
  "name?": "string",
  "avatar?": "string",
});

export const userProfile = /*@__PURE__*/ type({
  id: "string",
  "name?": "string",
  "avatar?": "string",
});
