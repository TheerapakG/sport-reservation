import { type, Type } from "arktype";
import { Effect } from "effect";
import { ArktypeError } from "~~/models/errors.ts";

/*@__NO_SIDE_EFFECTS__*/
export const effectType = <
  T = unknown,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  $ = {},
>(
  t: Type<T, $>,
  data: unknown,
): Effect.Effect<Type<T, $>["infer"], ArktypeError> => {
  return Effect.gen(function* () {
    const result = t(data);
    if (result instanceof type.errors) {
      return yield* Effect.fail(new ArktypeError());
    }
    return result;
  });
};
