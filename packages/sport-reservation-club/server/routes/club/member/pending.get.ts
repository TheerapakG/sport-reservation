import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Array, Effect, Equivalence, Option } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UserClient } from "sport-reservation-user/client";
import { userProfile } from "sport-reservation-user/models";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getClubMemberPending",
  response: response(
    type({
      members: [
        {
          user: [userProfile, "|", "undefined"],
          status: "'pending'",
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
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const {
      params: {
        query: { clubId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const { client: oauthClient } = yield* OAuthClient;

    const requesterId = yield* Effect.flatMap(
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

    const clubRepository = yield* ClubRepository;

    const clubOption = (yield* clubRepository.getClubsByIds({
      clubIds: [clubId],
    }))[0];
    if (
      !Option.getEquivalence(Equivalence.string)(
        Option.map(clubOption, (club) => club.group.creatorId),
        Option.some(requesterId),
      )
    ) {
      yield* Effect.fail(new OAuthError());
    }

    const members = yield* clubRepository.getClubPendingMembers({
      clubId,
    });

    const pendingMembers = members
      .filter((member) => member.status === "pending")
      .map((member) => ({
        userId: member.userId,
        status: "pending" as const,
      }));

    const userClient = yield* UserClient;
    const userProfiles = yield* userClient.getUserProfiles({
      query: {
        ids: pendingMembers.map((member) => member.userId),
      },
    });

    return {
      members: Array.zip(pendingMembers, userProfiles).map(
        ([member, profile]) => ({
          user: profile,
          status: member.status,
        }),
      ),
    };
  }),
);
