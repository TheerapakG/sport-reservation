import { destr } from "destr";
import { Effect, Match } from "effect";
import { Simplify } from "effect/Types";
import {
  EventHandlerRequest,
  getQuery,
  getRequestHeader,
  getRouterParams,
  H3Event,
  readBody,
  readFormData,
} from "h3";
import { ArktypeError } from "~~/src/models/errors";
import {
  AnyCoercedParamsType,
  FetchBodyType,
  FetchQueryType,
  FetchRouterType,
  FetchTypeConfig,
} from "../config/fetchConfig";
import { effectType } from "./effectType";
import { readTypedFormData } from "./formData";

type EventHandlerQueryType<C extends FetchTypeConfig> = Simplify<
  C["query"] extends infer Q
    ? Q extends AnyCoercedParamsType
      ? Q["config"]["decode"] extends true
        ? FetchQueryType<C>
        : never
      : never
    : never
>;
type EventHandlerBodyType<C extends FetchTypeConfig> = Simplify<
  C["body"] extends infer B
    ? B extends AnyCoercedParamsType
      ? B["config"]["decode"] extends true
        ? FetchBodyType<C>
        : never
      : never
    : never
>;
type EventHandlerRouterType<C extends FetchTypeConfig> = Simplify<
  C["router"] extends infer R
    ? R extends AnyCoercedParamsType
      ? R["config"]["decode"] extends true
        ? FetchRouterType<C>
        : never
      : never
    : never
>;

export type EffectEventHandlerParams<
  C extends FetchTypeConfig = FetchTypeConfig,
> = {
  query: EventHandlerQueryType<C>;
  body: EventHandlerBodyType<C>;
  router: EventHandlerRouterType<C>;
};

/*@__NO_SIDE_EFFECTS__*/
export const effectEventHandlerParams = <
  Request extends EventHandlerRequest = EventHandlerRequest,
  C extends FetchTypeConfig = FetchTypeConfig,
>(
  event: H3Event<Request>,
  { query, body, router }: C,
): Effect.Effect<Simplify<EffectEventHandlerParams<C>>, ArktypeError> =>
  Effect.gen(function* () {
    const params = {
      ...((query && query.config.decode
        ? {
            query: yield* effectType(
              query.type,
              Object.fromEntries(
                Object.entries(getQuery(event)).map(([key, value]) => [
                  key,
                  Array.isArray(value) ? value.map(destr) : destr(value),
                ]),
              ),
            ),
          }
        : {}) as { query: EventHandlerQueryType<C> }),
      ...((body && body.config.decode
        ? {
            body: yield* Match.value(
              getRequestHeader(event, "content-type"),
            ).pipe(
              Match.when("application/json", () =>
                Effect.gen(function* () {
                  const bodyValue = yield* Effect.promise(() =>
                    readBody(event),
                  );
                  return yield* effectType(body.type, bodyValue);
                }),
              ),
              Match.when("application/x-www-form-urlencoded", () =>
                Effect.gen(function* () {
                  const bodyValue = yield* Effect.promise(() =>
                    readBody(event),
                  );
                  return yield* effectType(body.type, bodyValue);
                }),
              ),
              Match.when("multipart/form-data", () =>
                Effect.gen(function* () {
                  const formData = yield* Effect.promise(() =>
                    readFormData(event),
                  );
                  return yield* readTypedFormData(body.type, formData);
                }),
              ),
              Match.orElseAbsurd,
            ),
          }
        : {}) as { body: EventHandlerBodyType<C> }),
      ...((router && router.config.decode
        ? {
            router: yield* effectType(
              router.type,
              getRouterParams(event, { decode: true }),
            ),
          }
        : {}) as { router: EventHandlerRouterType<C> }),
    };

    return params;
  });
