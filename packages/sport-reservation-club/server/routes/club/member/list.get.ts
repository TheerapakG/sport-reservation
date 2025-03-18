import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getClubMembers",
  response: response(
    type({
      members: [
        {
          groupId: "string",
          userId: "string",
          status: "'pending' | 'member'",
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
    const {
      params: {
        query: { clubId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const clubRepository = yield* ClubRepository;
    const members = yield* clubRepository.getClubMembers({
      clubId,
    });

    return {
      members,
    };
  }),
);
