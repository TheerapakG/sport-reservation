import { type, Type } from "arktype";
import { Effect } from "effect";
import { ArktypeError } from "./models/errors";

export const effectType = <
  T = unknown,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  $ = {},
>(
  t: Type<T, $>,
  data: unknown,
) =>
  Effect.gen(function* () {
    const result = t(data);
    if (result instanceof type.errors) {
      return yield* Effect.fail(new ArktypeError());
    }
    return result;
  });
