import { type, Type } from "arktype";
import { Effect } from "effect";
import { ArktypeError } from "~~/models/errors";

/*@__NO_SIDE_EFFECTS__*/
export const effectType = <
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  T extends Type<unknown, {}> = Type<unknown, {}>,
>(
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
