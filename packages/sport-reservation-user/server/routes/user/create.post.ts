import { Effect } from "effect";
import { effectEventHandler } from "~~/server/utils/effectEventHandler";
import { UserRepository } from "~~/repositories/userRepository";
import { defineEventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { EventContext } from "sport-reservation-common/utils/effectEventHandler";
import { userProfile, userProfileCreate } from "~~/models/user";
import { effectEventData } from "sport-reservation-common/utils/effectEventData";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateUserProfile",
  response: userProfile,
  body: userProfileCreate,
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { body } = yield* effectEventData(event, handlerConfig);

    const userRepository = yield* UserRepository;
    const { id, name, avatar } = yield* yield* userRepository.createUserProfile(
      { name: body.name, avatar: body.avatar },
    );

    return {
      id,
      ...(name ? { name } : {}),
      ...(avatar ? { avatar } : {}),
    };
  }),
});
