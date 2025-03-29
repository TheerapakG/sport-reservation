import { destr } from "destr";
import { Effect } from "effect";
import { Simplify } from "effect/Types";
import {
  EventHandlerRequest,
  getQuery,
  getRouterParams,
  H3Event,
  readBody,
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
    return {
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
            body: yield* effectType(
              body.type,
              yield* Effect.promise(async () => await readBody(event)),
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
  });
