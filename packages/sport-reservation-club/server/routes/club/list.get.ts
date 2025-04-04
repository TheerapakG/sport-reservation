import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { UploadClient } from "sport-reservation-upload/client";
import { UserClient } from "sport-reservation-user/client";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { clubType } from "~/models/club";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getClubList",
  response: response(
    type({
      clubs: [clubType, "[]"],
    }),
    { stream: false },
  ),
  query: params(
    type({
      offset: "number",
      limit: "number",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { offset, limit },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const clubRepository = yield* ClubRepository;
    const clubs = yield* clubRepository.getClubsByLimit({
      offset,
      limit,
    });

    const extendedClubs = yield* Effect.forEach(clubs, (club) =>
      Effect.gen(function* () {
        const uploadClient = yield* UploadClient;
        const { url: image } = club.club.image
          ? yield* uploadClient.getDownloadPresignedUrl({
              query: { key: club.club.image },
            })
          : { url: undefined };

        const userClient = yield* UserClient;
        const creator = yield* userClient.getUserProfile({
          query: { id: club.group.creatorId },
        });

        return {
          club,
          image,
          creator,
        };
      }),
    );

    return {
      clubs: extendedClubs.map(({ club, image, creator }) => ({
        id: club.group.publicId,
        creator,
        ...(club.group.name ? { name: club.group.name } : {}),
        ...(image ? { image } : {}),
        ...(club.club.description
          ? { description: club.club.description }
          : {}),
        ...(club.club.location ? { location: club.club.location } : {}),
        ...(club.club.locationDescription
          ? { locationDescription: club.club.locationDescription }
          : {}),
        size: club.size,
      })),
    };
  }),
);
