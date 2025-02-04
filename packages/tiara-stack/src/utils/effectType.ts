import { type } from "arktype";
import { Effect } from "effect";
import { Simplify } from "effect/Types";
import { ArktypeError } from "~~/src/models/errors";

/*@__NO_SIDE_EFFECTS__*/
export const effectTypeCheck = <V>(
  value: V,
): Effect.Effect<
  V extends type.errors | Simplify<type.errors> ? never : V,
  ArktypeError
> =>
  Effect.gen(function* () {
    if (value instanceof type.errors) {
      return yield* Effect.fail(new ArktypeError(value));
    }
    return value as V extends type.errors | Simplify<type.errors> ? never : V;
  });

/*@__NO_SIDE_EFFECTS__*/
export const effectType = <T extends type.Any = type.Any>(
  t: T,
  data: unknown,
): Effect.Effect<T["infer"], ArktypeError> =>
  Effect.gen(function* () {
    const result = t(data);
    return yield* effectTypeCheck(result);
  });
