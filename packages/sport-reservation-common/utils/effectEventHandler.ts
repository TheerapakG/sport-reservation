import { Effect, Context, Exit, Cause, pipe } from "effect";
import {
  eventHandler,
  H3Event,
  EventHandlerRequest,
  EventHandlerResponse,
  EventHandler,
  createError,
} from "h3";
import { EventHandlerConfig } from "~~/utils/eventHandlerConfig";
import { effectType } from "~~/utils/effectType";
import { unknownType } from "./type";

export class EventContext
  extends /*@__PURE__*/ Context.Tag("EventContext")<
    EventContext,
    { event: H3Event<EventHandlerRequest> }
  >() {}

export type EffectEventHandler<
  T extends typeof unknownType = typeof unknownType,
  Request extends EventHandlerRequest = EventHandlerRequest,
> = EventHandler<Request, Promise<T["infer"]>>;

export type EffectEventHandlerOptions<
  C extends EventHandlerConfig<string>,
  R = never,
> = {
  config: C;
  handler: Effect.Effect<
    EventHandlerResponse<C["response"]["infer"]>,
    unknown,
    EventContext | R
  >;
};

const effectEventHandler = <
  C extends EventHandlerConfig<string>,
  Request extends EventHandlerRequest = EventHandlerRequest,
  R = never,
>({
  config,
  handler,
}: EffectEventHandlerOptions<C, R>): EffectEventHandler<
  C["response"],
  Request
> => {
  return eventHandler(async (event) => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        return yield* effectType(
          config.response,
          yield* pipe(
            handler,
            Effect.provideService(EventContext, { event }),
            Effect.provide(event.context.effectContext as Context.Context<R>),
          ),
        );
      }),
    );
    if (Exit.isFailure(exit)) {
      const cause = exit.cause;
      if (Cause.isDieType(cause) && Cause.isUnknownException(cause.defect)) {
        throw createError(cause.defect.message);
      } else {
        throw createError(exit.toString());
      }
    }
    return exit.value;
  });
};

/*@__NO_SIDE_EFFECTS__*/
export const createEffectEventHandler = <R = never>() => {
  return <
    C extends EventHandlerConfig<string>,
    Request extends EventHandlerRequest = EventHandlerRequest,
  >({
    config,
    handler,
  }: EffectEventHandlerOptions<C, R>) =>
    effectEventHandler<C, Request, R>({ config, handler });
};
