import { type } from "arktype";
import { Effect } from "effect";
import { effectEventHandler } from "~~/server/utils/effectEventHandler";
import { UserRepository } from "~~/repositories/userRepository";
import { effectType } from "sport-reservation-common/utils/effectType";
import { defineEventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { EventContext } from "sport-reservation-common/utils/effectEventHandler";
import { noInferOut } from "sport-reservation-common/utils/noInfer";
import { userProfile } from "~~/models/user";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserProfileById",
  response: userProfile,
  query: noInferOut(
    type({
      id: "string.integer.parse",
    }),
  ),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const { event } = yield* EventContext;

    const { id } = yield* effectType(
      handlerConfig.query,
      yield* Effect.tryPromise(async () => await getQuery(event)),
    );

    const userRepository = yield* UserRepository;
    const {
      id: userProfileId,
      name,
      avatar,
    } = yield* yield* userRepository.findUserProfileById({ id });

    return {
      id: userProfileId,
      ...(name ? { name } : {}),
      ...(avatar ? { avatar } : {}),
    };
  }),
});
