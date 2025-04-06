import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { Effect } from "effect";
import { UploadClient } from "sport-reservation-upload/client";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { userProfile, userProfileCreate } from "~/models/user";
import { LocationRepository } from "~/repositories/locationRepository";
import { ObjectiveRepository } from "~/repositories/objectiveRepository";
import { SportRepository } from "~/repositories/sportRepository";
import { UserRepository } from "~/repositories/userRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateUserProfile",
  response: response(userProfile, { stream: false }),
  body: params(userProfileCreate),
});
export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: { body },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const userRepository = yield* UserRepository;
    const profile = yield* yield* userRepository.createUserProfile({
      name: body.name,
      avatar: body.avatar,
    });

    const [sports, objectives, locations] = yield* Effect.all([
      Effect.gen(function* () {
        const sportRepository = yield* SportRepository;
        return yield* sportRepository.getSportsByUserId({
          userId: profile.publicId,
        });
      }),
      Effect.gen(function* () {
        const objectiveRepository = yield* ObjectiveRepository;
        return yield* objectiveRepository.getObjectivesByUserId({
          userId: profile.publicId,
        });
      }),
      Effect.gen(function* () {
        const locationRepository = yield* LocationRepository;
        return yield* locationRepository.getLocationsByUserId({
          userId: profile.publicId,
        });
      }),
    ]);

    const uploadClient = yield* UploadClient;
    const { url: avatar } = profile.avatar
      ? yield* uploadClient.getDownloadPresignedUrl({
          query: { key: profile.avatar },
        })
      : {
          url: undefined,
        };

    return {
      id: profile.publicId,
      ...(profile.name ? { name: profile.name } : {}),
      ...(avatar ? { avatar } : {}),
      ...(profile.availability ? { availability: profile.availability } : {}),
      ...(profile.gender ? { gender: profile.gender } : {}),
      membership: profile.membership,
      ...(profile.birthDate
        ? { birthDate: profile.birthDate.toISOString() }
        : {}),
      sports: sports.map((sport) => ({
        sportId: sport.sport.publicId,
        sportType: sport.sport.sportType,
      })),
      objectives: objectives.map((objective) => ({
        objectiveId: objective.objective.publicId,
        objectiveType: objective.objective.objectiveType,
      })),
      locations: locations.map((location) => ({
        locationId: location.location.publicId,
        ...(location.location.location
          ? { location: location.location.location }
          : {}),
        ...(location.location.locationDescription
          ? { locationDescription: location.location.locationDescription }
          : {}),
      })),
    };
  }),
);
