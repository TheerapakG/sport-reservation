import { Effect } from "effect";
import { effectEventHandler } from "~/utils/effectEventHandler";
import { UserRepository } from "~/repositories/userRepository";
import { defineEventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { EventParamsContext } from "sport-reservation-common/utils/effectEventHandler";
import { userProfile, userProfileCreate } from "~/models/user";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateUserProfile",
  response: userProfile,
  body: userProfileCreate,
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const {
      params: { body },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

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
