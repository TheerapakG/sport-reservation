import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UploadClient } from "sport-reservation-upload/client";
import { getUploadClientBodyType } from "sport-reservation-upload/models";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { typedFormData } from "tiara-stack/utils/formData";
import { OAuthClient } from "~/layers";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateClubEvent",
  response: response(type({ eventId: "string" }), { stream: false }),
  body: params(
    type({
      clubId: "string",
      name: "string",
      image: "File",
      description: "string",
      location: ["number", "number"],
      locationDescription: "string",
      autoAccept: "boolean",
      sizeLimit: "number",
      skillLevel: "('beginner' | 'intermediate' | 'advanced')[]",
      sportType: "('badminton' | 'tennis' | 'running')[]",
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
          clubId,
          name,
          image,
          description,
          location,
          locationDescription,
          autoAccept,
          sizeLimit,
          skillLevel,
          sportType,
        },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const { client: oauthClient } = yield* OAuthClient;

    // Verify user authentication
    yield* Effect.flatMap(
      Effect.promise(async () =>
        getSubjectTypeFromToken({
          type: "user",
          client: oauthClient,
          accessToken,
          refreshToken: undefined,
        }),
      ),
      (user) => (user ? Effect.succeed(user) : Effect.fail(new OAuthError())),
    );

    // Create event for the club
    const eventRepository = yield* EventRepository;
    const { eventId } = yield* yield* eventRepository.createEventByClub({
      clubId,
      name,
      description,
      location,
      locationDescription,
      autoAccept,
      sizeLimit,
      skillLevel,
      sportType,
    });

    const uploadClient = yield* UploadClient;
    const { key: imageKey } = yield* uploadClient.postUploadFromBody({
      body: typedFormData(getUploadClientBodyType("postUploadFromBody"), {
        key: `event/${eventId}/image`,
        file: image,
      }),
    });

    yield* eventRepository.updateEvent({
      eventId,
      image: imageKey,
    });

    return { eventId };
  }),
);
