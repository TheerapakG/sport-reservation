import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { getHeader } from "h3";
import { defineEventHandlerConfig } from "tiara-stack/config";
import { noInferOut } from "tiara-stack/utils/noInfer";
import { AuthKey } from "~/layers";
import { FriendRepository } from "~/repositories/friendRepository";
import getUserProfile from "~~/client/methods/getUserProfile";

export const handlerConfig = defineEventHandlerConfig({
  name: "postRejectFriendRequest",
  response: type(
    {
      groupId: "string",
      userId: "string",
      status: "string",
    },
    "[]",
  ),
  body: noInferOut(
    type({
      fromUserId: "string",
    }),
  ),
});

export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const { event } = yield* EventContext;
    const {
      params: {
        body: { fromUserId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const authKey = yield* AuthKey;
    const { id } = yield* getUserProfile({
      token: getHeader(event, "authorization")?.split(" ", 2)[1] ?? "",
      authKey,
    });

    const friendRepository = yield* FriendRepository;
    const members = yield* friendRepository.rejectFriendRequest(fromUserId, id);
    return members;
  }),
});
