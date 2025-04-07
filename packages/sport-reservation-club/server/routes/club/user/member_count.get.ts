import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserMemberClubsCount",
  query: params(
    type({
      userId: "string",
    }),
  ),
  response: response(
    type({
      count: "number",
    }),
    { stream: false },
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { userId },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const clubRepository = yield* ClubRepository;

    const count = yield* clubRepository.getUserMemberClubsCount({ userId });

    return { count };
  }),
);
