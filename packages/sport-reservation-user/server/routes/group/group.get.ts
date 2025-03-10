import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { group } from "~/models/group";
import { GroupRepository } from "~/repositories/groupRepository";

// Note: You'll need to create a group model similar to userProfile
export const handlerConfig = defineEventHandlerConfig({
  name: "getGroupById",
  response: response(group, { stream: false }),
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
    const group = yield* yield* groupRepository.findGroupById({ publicId: id });

    return {
      id: group.publicId,
      ...(group.name && { name: group.name }),
      type: group.type,
      creatorId: group.creatorId,
    };
  }),
);
