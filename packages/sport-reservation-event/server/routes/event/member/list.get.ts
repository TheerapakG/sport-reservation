import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Array, Effect } from "effect";
import { UserClient } from "sport-reservation-user/client";
import { userProfile } from "sport-reservation-user/models";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getEventMemberList",
  response: response(
    type({
      members: [
        {
          user: [userProfile, "|", "undefined"],
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

    const userClient = yield* UserClient;
    const userProfiles = yield* userClient.getUserProfiles({
      query: {
        ids: JSON.stringify(activeMembers.map((member) => member.userId)),
      },
    });

    return {
      members: Array.zip(activeMembers, userProfiles).map(
        ([member, profile]) => ({
          user: profile,
          size: member.size,
          status: member.status,
        }),
      ),
    };
  }),
);
