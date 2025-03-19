import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getEventMemberList",
  response: response(
    type({
      members: [
        {
          userId: "string",
          size: "number",
          status: "'member'",
        },
        "[]",
      ],
    }),
    { stream: false },
  ),
  query: params(
    type({
      eventId: "string",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { eventId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const eventRepository = yield* EventRepository;

    const members = yield* eventRepository.getEventMembers({
      eventId,
    });

    const activeMembers = members
      .filter((member) => member.status === "member")
      .map((member) => ({
        userId: member.userId,
        size: member.size,
        status: "member" as const,
      }));

    return {
      members: activeMembers,
    };
  }),
);
