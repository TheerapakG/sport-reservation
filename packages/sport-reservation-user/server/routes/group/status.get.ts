import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { GroupRepository } from "~/repositories/groupRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getGroupStatus",
  response: response(type({ status: "string" }), { stream: false }),
  query: params(
    type({
      groupId: "string",
      userId: "string",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { groupId, userId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const groupRepository = yield* GroupRepository;
    return yield* yield* groupRepository.getGroupStatusOfUser({
      groupId,
      userId,
    });
  }),
);
