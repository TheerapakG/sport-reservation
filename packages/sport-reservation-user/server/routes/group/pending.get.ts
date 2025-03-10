import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { GroupRepository } from "~/repositories/groupRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getGroupMembers",
  response: response(type({ userId: "string" }, "[]"), { stream: false }),
  query: params(
    type({
      id: "string",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { id },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const groupRepository = yield* GroupRepository;
    const members = yield* groupRepository.getGroupPendingMembers({
      publicId: id,
    });

    return members.map((member) => ({
      userId: member.userId,
    }));
  }),
);
