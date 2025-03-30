import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Array, Effect } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UserClient } from "sport-reservation-user/client";
import { userProfile } from "sport-reservation-user/models";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { ScheduleRepository } from "~/repositories/scheduleRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getScheduleMemberList",
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
      scheduleId: "string",
      repeatIndex: "number",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const {
      params: {
        query: { scheduleId, repeatIndex },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const { client: oauthClient } = yield* OAuthClient;

    // Authenticate user
    yield* Effect.flatMap(
      Effect.promise(async () =>
        getSubjectTypeFromToken({
          type: "user",
          client: oauthClient,
          accessToken,
          refreshToken: undefined,
        }),
      ),
      (user) =>
        user ? Effect.succeed(user.id) : Effect.fail(new OAuthError()),
    );

    const scheduleRepository = yield* ScheduleRepository;
    const members = yield* scheduleRepository.getScheduleMembers({
      scheduleId,
      repeatIndex,
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
        ids: activeMembers.map((member) => member.userId),
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
