import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthClient } from "~/layers";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postRemoveClubMember",
  response: response(type({}), { stream: false }),
  body: params(
    type({
      clubId: "string",
      userId: "string",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const {
      params: {
        body: { clubId, userId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const { client: oauthClient } = yield* OAuthClient;

    const user = yield* Effect.promise(async () =>
      getSubjectTypeFromToken({
        type: "user",
        client: oauthClient,
        accessToken,
        refreshToken: undefined,
      }),
    );

    if (!user) return {};

    const clubRepository = yield* ClubRepository;
    yield* clubRepository.removeMember({
      clubId,
      userId,
      removerId: user.id,
    });

    return {};
  }),
);
