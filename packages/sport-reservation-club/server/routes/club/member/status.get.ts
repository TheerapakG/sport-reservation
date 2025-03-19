import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getClubMemberStatus",
  response: response(
    type({
      status: "'pending' | 'member'",
    }),
    { stream: false },
  ),
  query: params(
    type({
      clubId: "string",
      userId: "string",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { clubId, userId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const clubRepository = yield* ClubRepository;

    return yield* clubRepository.getClubMemberStatus({
      clubId,
      userId,
    });
  }),
);
