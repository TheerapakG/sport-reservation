import { type } from "arktype";
import { Effect } from "effect";
import { lineAuthToken } from "~~/models/line.ts";
import { effectType } from "sport-reservation-common/utils/effectType";
import { LineLoginRepository } from "~~/repositories/lineLoginRepository.ts";
import { effectEventHandler } from "~~/server/utils/effectEventHandler";
import { anyObject } from "sport-reservation-common/utils/type";

export const handlerName = "postGetLineLoginAuthToken";
export const handlerType = lineAuthToken;
export const handlerQueryParams = type({
  code: "string",
  state: "string",
});
export const handlerRouterParams = anyObject;
export default effectEventHandler({
  type: handlerType,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const { event } = yield* EventContext;
    const lineLoginRepository = yield* LineLoginRepository;
    const { code, state } = yield* effectType(
      handlerQueryParams,
      yield* Effect.tryPromise(async () => await readBody(event)),
    );
    const { access, id, refresh, type } =
      yield* lineLoginRepository.getAuthToken({ code, state });
    return {
      access,
      id,
      refresh,
      type,
    };
  }),
});
