import { generic, Hkt, Type, type } from "arktype";
import { loadConfig } from "c12";
import { Config, Console, Effect, Redacted } from "effect";
import { Simplify } from "effect/Types";
import { snakeCase, upperFirst } from "scule";
import { ArktypeError } from "~~/src/models/errors";
import { effectType } from "../utils/effectType";

type Apply<T, Arr> = Arr extends [...infer Head, infer Tail]
  ? Tail extends "redacted"
    ? Apply<Redacted.Redacted<T>, Head>
    : T
  : T;
type Mark<T, Arr> = { _mark: Arr; value: T };
type Unmark<T> = T extends Mark<infer U, infer Arr> ? Apply<U, Arr> : T;

type SimplifyStringObject<T> =
  T extends Record<string, unknown> ? Simplify<T> : T;

export type RuntimeConfigShape = {
  [key: string]: type.Any<Mark<unknown, unknown>> | RuntimeConfigShape;
};
export type InferConfig<Shape extends RuntimeConfigShape> =
  SimplifyStringObject<{
    [K in keyof Shape]: Shape[K] extends RuntimeConfigShape
      ? InferConfig<Shape[K]>
      : Unmark<Shape[K]["infer"]>;
  }>;

const _configShapeToArray = <Shape extends RuntimeConfigShape>(
  shape: Shape,
  prefix: string = "",
): [string, type.Any<Mark<unknown, unknown>>][] => {
  return Object.entries(shape)
    .map(([key, value]) => {
      if (value instanceof Type) {
        return [[`${prefix}${upperFirst(key)}`, value]] as [
          string,
          type.Any<Mark<unknown, unknown>>,
        ][];
      } else {
        return _configShapeToArray(value, `${prefix}${upperFirst(key)}`);
      }
    })
    .flat();
};

const configShapeToEnvShape = <Shape extends RuntimeConfigShape>(
  shape: Shape,
): Type<Record<string, Config.Config<unknown>>> => {
  return type(
    Object.fromEntries(
      _configShapeToArray(shape).map(([key, value]) => [
        snakeCase(key).toUpperCase(),
        value,
      ]),
    ),
    "&",
    { "[string]": "unknown" },
  );
};

const _effectConfig = <Shape extends RuntimeConfigShape>(
  shape: Shape,
  typedEnv: Record<string, Config.Config<unknown>>,
  prefix: string = "",
): Config.Config<SimplifyStringObject<InferConfig<Shape>>> => {
  return Config.all(
    Object.fromEntries(
      Object.entries(shape).map(([key, value]) => {
        if (value instanceof Type) {
          return [
            key,
            typedEnv[snakeCase(`${prefix}${upperFirst(key)}`).toUpperCase()],
          ];
        } else {
          return [
            key,
            _effectConfig(value, typedEnv, `${prefix}${upperFirst(key)}`),
          ];
        }
      }),
    ),
  ) as Config.Config<SimplifyStringObject<InferConfig<Shape>>>;
};

/*@__NO_SIDE_EFFECTS__*/
export const effectConfig = <Shape extends RuntimeConfigShape>(
  shape: Shape,
): Effect.Effect<
  Config.Config<SimplifyStringObject<InferConfig<Shape>>>,
  ArktypeError
> => {
  return Effect.gen(function* () {
    yield* Console.log("loading runtime config...");
    yield* Effect.promise(async () => await loadConfig({ dotenv: true }));
    const typedEnv = yield* effectType(
      configShapeToEnvShape(shape),
      process.env,
    );
    return _effectConfig(shape, typedEnv);
  });
};

class ConfigHkt extends Hkt<[unknown]> {
  declare body: Mark<this[0], []>;
}

export const config = generic(["T", "unknown"])(
  (args) => args.T.pipe((v) => Config.succeed(v)),
  ConfigHkt,
);

class RedactedHkt extends Hkt<[unknown]> {
  declare body: Mark<this[0], ["redacted"]>;
}

export const redacted = generic(["T", "unknown"])(
  (args) => args.T.pipe((v) => Config.succeed(Redacted.make(v))),
  RedactedHkt,
);
