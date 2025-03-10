import { type } from "arktype";

export const chatMessageInternal = /*@__PURE__*/ type({
  id: "number",
  publicId: "string",
  chatId: "string",
  senderId: "string",
  message: "string | null",
  imageUrl: "string | null",
  createdAt: "string.date.parse",
  updatedAt: "string.date.parse",
  deletedAt: "string.date.parse | null",
});

export const chatMessage = /*@__PURE__*/ type({
  id: "string",
  chatId: "string",
  senderId: "string",
  message: "string | null",
  imageUrl: "string | null",
  createdAt: "string.date.parse",
  updatedAt: "string.date.parse",
});
