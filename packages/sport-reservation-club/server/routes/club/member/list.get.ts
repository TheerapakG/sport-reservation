import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Array, Effect } from "effect";
import { UserClient } from "sport-reservation-user/client";
import { userProfile } from "sport-reservation-user/models";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getClubMembers",
  response: response(
    type({
      members: [
        {
          user: [userProfile, "|", "undefined"],
          status: "'member'",
        },
        "[]",
      ],
    }),
    { stream: false },
  ),
  query: params(
    type({
      clubId: "string",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { clubId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const clubRepository = yield* ClubRepository;
    const members = yield* clubRepository.getClubMembers({
      clubId,
    });

    const activeMembers = members
      .filter((member) => member.status === "member")
      .map((member) => ({
        userId: member.userId,
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
          status: member.status,
        }),
      ),
    };
  }),
);
