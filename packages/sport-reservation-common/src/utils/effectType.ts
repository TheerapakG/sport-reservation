import { type } from "arktype";
import { Effect } from "effect";
import { ArktypeError } from "~~/src/models/errors";

/*@__NO_SIDE_EFFECTS__*/
export const effectType = <T extends type.Any = type.Any>(
  t: T,
  data: unknown,
): Effect.Effect<T["infer"], ArktypeError> =>
  Effect.gen(function* () {
    const result = t(data);
    if (result instanceof type.errors) {
      return yield* Effect.fail(new ArktypeError(result));
    }
    return result;
  });
