import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Equivalence, Option } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postEventMemberRemove",
  response: response(type({}), { stream: false }),
  body: params(
    type({
      eventId: "string",
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
        body: { eventId, userId },
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

    const eventRepository = yield* EventRepository;
    const eventOption = yield* eventRepository.getEvent({ eventId });
    if (
      requesterId === userId ||
      !Option.getEquivalence(Equivalence.string)(
        Option.map(eventOption, (event) => event.group.creatorId),
        Option.some(requesterId),
      )
    ) {
      yield* Effect.fail(new OAuthError());
    }

    yield* eventRepository.removeMember({
      eventId,
      userId,
    });

    return {};
  }),
);
