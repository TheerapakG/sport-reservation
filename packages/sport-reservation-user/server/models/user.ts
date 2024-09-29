import { type } from "arktype";

export const userProfileCreate = /*@__PURE__*/ type({
  "name?": "string",
  "avatar?": "string",
});

export const userProfileUpdate = /*@__PURE__*/ type({
  id: "number",
  "name?": "string",
  "avatar?": "string",
});

export const userProfile = /*@__PURE__*/ type({
  id: "number",
  "name?": "string",
  "avatar?": "string",
});
