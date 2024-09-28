import { Effect } from "effect";
import { ArktypeError } from "~~/models/errors";
import {
  EventHandlerTypeConfig,
  EventHandlerBodyType,
  EventHandlerQueryType,
  EventHandlerRouterType,
} from "./eventHandlerConfig";
import {
  EventHandlerRequest,
  getQuery,
  getRouterParams,
  H3Event,
  readBody,
} from "h3";
import { effectType } from "./effectType";
import destr from "destr";
import { Simplify } from "effect/Types";

export type EffectEventHandlerParams<
  C extends EventHandlerTypeConfig = EventHandlerTypeConfig,
> = {
  query: EventHandlerQueryType<C>;
  body: EventHandlerBodyType<C>;
  router: EventHandlerRouterType<C>;
};

/*@__NO_SIDE_EFFECTS__*/
export const effectEventHandlerParams = <
  Request extends EventHandlerRequest = EventHandlerRequest,
  C extends EventHandlerTypeConfig = EventHandlerTypeConfig,
>(
  event: H3Event<Request>,
  { query, body, router }: C,
): Effect.Effect<Simplify<EffectEventHandlerParams<C>>, ArktypeError> =>
  Effect.gen(function* () {
    return {
      ...((query
        ? {
            query: yield* effectType(
              query,
              Object.fromEntries(
                Object.entries(getQuery(event)).map(([key, value]) => [
                  key,
                  Array.isArray(value) ? value.map(destr) : destr(value),
                ]),
              ),
            ),
          }
        : {}) as { query: EventHandlerQueryType<C> }),
      ...((body
        ? {
            body: yield* effectType(
              body,
              yield* Effect.promise(async () => await readBody(event)),
            ),
          }
        : {}) as { body: EventHandlerBodyType<C> }),
      ...((router
        ? {
            router: yield* effectType(
              router,
              getRouterParams(event, { decode: true }),
            ),
          }
        : {}) as { router: EventHandlerRouterType<C> }),
    };
  });
