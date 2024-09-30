import { type } from "arktype";
import { Cause, Console, Context, Effect, Exit, pipe } from "effect";
import { Simplify } from "effect/Types";
import {
  createError,
  eventHandler,
  EventHandler,
  EventHandlerRequest,
  EventHandlerResponse,
  H3Event,
} from "h3";
import { isArktypeError, isFetchError, isS3Error } from "~~/src/models/errors";
import {
  effectEventHandlerParams,
  EffectEventHandlerParams,
} from "~~/src/utils/effectEventHandlerParams";
import { effectType } from "~~/src/utils/effectType";
import {
  EventHandlerConfig,
  EventHandlerTypeConfig,
} from "~~/src/utils/eventHandlerConfig";

export class EventContext
  extends /*@__PURE__*/ Context.Tag("EventContext")<
    EventContext,
    { event: H3Event<EventHandlerRequest> }
  >() {}

export class EventParamsContext
  extends /*@__PURE__*/ Context.Tag("EventParamsContext")<
    EventParamsContext,
    { params: unknown }
  >()
{
  public static typed<
    C extends EventHandlerTypeConfig = EventHandlerTypeConfig,
  >() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisCls = this;
    return Effect.gen(function* () {
      return (yield* thisCls) as {
        params: Simplify<EffectEventHandlerParams<C>>;
      };
    });
  }
}

export type EffectEventHandler<
  T extends type.Any = type.Any,
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
    EventContext | EventParamsContext | R
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
            Effect.provideService(EventParamsContext, {
              params: yield* effectEventHandlerParams(event, config),
            }),
            Effect.provide(event.context.effectContext as Context.Context<R>),
          ),
        );
      }),
    );
    if (Exit.isFailure(exit)) {
      const cause = exit.cause;
      if (Cause.isDieType(cause) && Cause.isUnknownException(cause.defect)) {
        Effect.runSync(Console.log(event.path, cause.defect));
        throw createError(cause.defect.message);
      } else if (Cause.isFailType(cause)) {
        const error = cause.error;
        if (isArktypeError(error) || isFetchError(error) || isS3Error(error)) {
          Effect.runSync(
            Console.log(event.path, Cause.fail(error.error.message)),
          );
          throw createError(error.error.message);
        }
      }
      Effect.runSync(Console.log(event.path, cause));
      throw createError(exit.toString());
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
