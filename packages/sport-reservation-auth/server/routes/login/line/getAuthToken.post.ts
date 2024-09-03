import { type } from "arktype";
import { Effect } from "effect";
import { lineAuthToken } from "~~/models/line.ts";
import { LineLoginRepository } from "~~/repositories/lineLoginRepository.ts";
import { effectEventHandler } from "~~/server/utils/effectEventHandler";

const queryParams = /*@__PURE__*/ type({ code: "string", state: "string" });

export const handlerType = lineAuthToken;
export default effectEventHandler({
  type: handlerType,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const { event } = yield* EventContext;
    const lineLoginRepository = yield* LineLoginRepository;
    const { code, state } = yield* effectType(
      queryParams,
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
