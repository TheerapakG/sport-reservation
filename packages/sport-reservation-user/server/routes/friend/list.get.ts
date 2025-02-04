import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { getHeader } from "h3";
import { defineEventHandlerConfig } from "tiara-stack/config";
import { AuthKey } from "~/layers";
import { FriendRepository } from "~/repositories/friendRepository";
import getUserProfile from "~~/client/methods/getUserProfile";

export const handlerConfig = defineEventHandlerConfig({
  name: "getFriendsList",
  response: type(
    {
      groupId: "string",
      userId: "string",
      status: "string",
    },
    "[]",
  ),
});

export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const { event } = yield* EventContext;

    const authKey = yield* AuthKey;
    const { id } = yield* getUserProfile({
      token: getHeader(event, "authorization")?.split(" ", 2)[1] ?? "",
      authKey,
    });

    const friendRepository = yield* FriendRepository;
    return yield* friendRepository.getFriends(id);
  }),
});
