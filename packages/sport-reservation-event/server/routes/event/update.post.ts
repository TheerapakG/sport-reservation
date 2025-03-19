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
  name: "postUpdateEvent",
  response: response(type({}), { stream: false }),
  body: params(
    type({
      eventId: "string",
      "name?": "string",
      "description?": "string",
      "location?": ["number", "number"],
      "locationDescription?": "string",
      "startAt?": "string", // ISO string format
      "endAt?": "string", // ISO string format
      "autoAccept?": "boolean",
      "sizeLimit?": "number",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const {
      params: {
        body: {
          eventId,
          name,
          description,
          location,
          locationDescription,
          startAt,
          endAt,
          autoAccept,
          sizeLimit,
        },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const { client: oauthClient } = yield* OAuthClient;

    const userId = yield* Effect.flatMap(
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
    const eventData = yield* eventRepository.getEvent({ eventId });
    if (
      !Option.getEquivalence(Equivalence.string)(
        Option.map(eventData, (eventData) => eventData.group.creatorId),
        Option.some(userId),
      )
    ) {
      yield* Effect.fail(new OAuthError());
    }

    yield* eventRepository.updateEvent({
      eventId,
      name,
      description,
      location,
      locationDescription,
      startAt: startAt ? new Date(startAt) : undefined,
      endAt: endAt ? new Date(endAt) : undefined,
      autoAccept,
      sizeLimit,
    });

    return {};
  }),
);
