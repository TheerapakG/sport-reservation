import { Effect } from "effect";
import { effectEventHandler } from "~~/server/utils/effectEventHandler";
import { UserRepository } from "~~/repositories/userRepository";
import { effectType } from "sport-reservation-common/utils/effectType";
import { defineEventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { EventContext } from "sport-reservation-common/utils/effectEventHandler";
import { userProfile, userProfileCreate } from "~~/models/user";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateUserProfile",
  response: userProfile,
  body: userProfileCreate,
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const { event } = yield* EventContext;

    const { name: bodyName, avatar: bodyAvatar } = yield* effectType(
      handlerConfig.body,
      yield* Effect.tryPromise(async () => await readBody(event)),
    );

    const userRepository = yield* UserRepository;
    const { id, name, avatar } = yield* yield* userRepository.createUserProfile(
      { name: bodyName, avatar: bodyAvatar },
    );

    return {
      id,
      ...(name ? { name } : {}),
      ...(avatar ? { avatar } : {}),
    };
  }),
});
