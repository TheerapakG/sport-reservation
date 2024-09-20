import { type } from "arktype";

export const lineLoginRequest = /*@__PURE__*/ type({
  url: "string",
});

export const lineAuthToken = /*@__PURE__*/ type({
  access: "string",
  id: "string",
  refresh: "string",
  type: "string",
});

export const lineProfileRequest = /*@__PURE__*/ type({
  access: "string",
  id: "string",
  refresh: "string",
  type: "string",
});

export const lineProfile = /*@__PURE__*/ type({
  id: "string",
  name: "string",
  avatar: "string",
});
