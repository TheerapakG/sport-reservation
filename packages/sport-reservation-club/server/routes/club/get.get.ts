import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { UploadClient } from "sport-reservation-upload/client";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { clubType } from "~/models";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getClub",
  response: response(clubType, { stream: false }),
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
    const { club, group } = yield* (yield* clubRepository.getClubs({
      clubIds: [clubId],
    }))[0];

    const uploadClient = yield* UploadClient;
    const { url: image } = club.image
      ? yield* uploadClient.getDownloadPresignedUrl({
          query: { key: club.image },
        })
      : { url: undefined };

    return {
      id: group.publicId,
      creatorId: group.creatorId,
      ...(group.name && { name: group.name }),
      ...(image && { image }),
      ...(club.description && { description: club.description }),
      ...(club.location && { location: club.location }),
      ...(club.locationDescription && {
        locationDescription: club.locationDescription,
      }),
    };
  }),
);
