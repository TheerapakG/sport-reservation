import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getClub",
  response: response(
    type({
      club: {
        "description?": "string",
        "location?": ["number", "number"],
        "locationDescription?": "string",
      },
      group: {
        id: "string",
        creatorId: "string",
        "name?": "string",
        type: "string",
      },
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
    const { club, group } = yield* yield* clubRepository.getClub({ clubId });

    return {
      club: {
        description: club.description ?? undefined,
        location: club.location ?? undefined,
        locationDescription: club.locationDescription ?? undefined,
      },
      group: {
        id: group.publicId,
        creatorId: group.creatorId,
        name: group.name ?? undefined,
        type: group.type,
      },
    };
  }),
);
