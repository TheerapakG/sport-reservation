import { encode } from "@msgpack/msgpack";
import { type } from "arktype";
import {
  Cause,
  Console,
  Context,
  Effect,
  Exit,
  pipe,
  Stream,
  SynchronizedRef,
} from "effect";
import { Simplify } from "effect/Types";
import {
  createError,
  eventHandler,
  EventHandler,
  EventHandlerRequest,
  getRequestIP,
  H3Event,
  setResponseHeader,
} from "h3";
import { ReadableStream } from "node:stream/web";
import {
  CoercedResponseType,
  EventHandlerConfig,
  EventHandlerResponseType,
  EventHandlerResponseValidatorType,
  EventHandlerTypeConfig,
} from "~~/src/config/eventHandlerConfig";
import {
  EffectContext,
  effectContextLive,
} from "~~/src/internal/effectContext";
import { isArktypeError, isFetchError, isS3Error } from "~~/src/models/errors";
import {
  effectEventHandlerParams,
  EffectEventHandlerParams,
} from "~~/src/utils/effectEventHandlerParams";
import { effectType } from "~~/src/utils/effectType";

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

export type EffectStreamEventHandler<
  Request extends EventHandlerRequest = EventHandlerRequest,
> = EventHandler<Request, Promise<ReadableStream<Uint8Array>>>;

export type EffectEventHandlerOptions<
  C extends EventHandlerConfig<
    string,
    CoercedResponseType<type.Any, { stream: false }>
  >,
  R = never,
> = {
  config: C;
  handler: () => Effect.Effect<
    EventHandlerResponseType<C>,
    unknown,
    EventContext | EventParamsContext | R
  >;
};

export type EffectStreamEventHandlerOptions<
  C extends EventHandlerConfig<
    string,
    CoercedResponseType<type.Any, { stream: true }>
  >,
  R = never,
> = {
  config: C;
  handler: () => Stream.Stream<
    EventHandlerResponseType<C>,
    unknown,
    EventContext | EventParamsContext | R
  >;
};

const getEffectContext = <R = never>() =>
  Effect.gen(function* () {
    const { latch, ref } = yield* EffectContext.typed<R>();
    yield* latch.await;
    return (yield* SynchronizedRef.get(ref)).context;
  });

const effectEventHandler = <
  Stream extends boolean,
  Opts extends Stream extends true
    ? EffectStreamEventHandlerOptions<
        EventHandlerConfig<
          string,
          CoercedResponseType<type.Any, { stream: Stream }>
        >,
        R
      >
    : Stream extends false
      ? EffectEventHandlerOptions<
          EventHandlerConfig<
            string,
            CoercedResponseType<type.Any, { stream: Stream }>
          >,
          R
        >
      : never,
  Request extends EventHandlerRequest = EventHandlerRequest,
  R = never,
>({
  config,
  handler,
}: Opts): Stream extends true
  ? EffectStreamEventHandler<Request>
  : EffectEventHandler<
      EventHandlerResponseValidatorType<Opts["config"]>,
      Request
    > => {
  const {
    name,
    response: {
      config: { stream },
    },
  } = config;
  return stream
    ? (eventHandler(async (event) => {
        setResponseHeader(event, "Content-Type", "application/vnd.msgpack");
        setResponseHeader(event, "Transfer-Encoding", "chunked");

        const exit = await Effect.runPromiseExit(
          Effect.gen(function* () {
            yield* Console.log(
              `[${event.method}]`,
              getRequestIP(event),
              event.path,
            );
            const wrappedHandler = Effect.functionWithSpan({
              body: () =>
                Stream.toReadableStreamEffect(
                  (
                    handler as () => Stream.Stream<
                      EventHandlerResponseType<Opts["config"]>,
                      unknown,
                      EventContext | EventParamsContext | R
                    >
                  )().pipe(Stream.map((item) => encode(item))),
                ),
              options: () => ({ name }),
            });
            return yield* effectType(
              config.response.type,
              yield* pipe(
                wrappedHandler(),
                Effect.provideService(EventContext, { event }),
                Effect.provideService(EventParamsContext, {
                  params: yield* effectEventHandlerParams(event, config),
                }),
                Effect.provide(
                  yield* pipe(
                    getEffectContext<R>(),
                    Effect.provide(effectContextLive),
                  ),
                ),
              ),
            );
          }),
        );
        if (Exit.isFailure(exit)) {
          const cause = exit.cause;
          if (
            Cause.isDieType(cause) &&
            Cause.isUnknownException(cause.defect)
          ) {
            Effect.runSync(
              Console.log("[die]", event.path, Cause.prettyErrors(cause)),
            );
            throw createError(cause.defect.message);
          } else if (Cause.isFailType(cause)) {
            const error = cause.error;
            if (
              isArktypeError(error) ||
              isFetchError(error) ||
              isS3Error(error)
            ) {
              Effect.runSync(
                Console.log("[fail]", event.path, Cause.prettyErrors(cause)),
              );
              throw createError(error.error?.message ?? "unknown error cause");
            }
          }
          Effect.runSync(
            Console.log("[fail]", event.path, Cause.prettyErrors(cause)),
          );
          throw createError(exit.toString());
        }
        return exit.value;
      }) as EffectStreamEventHandler<Request>)
    : (eventHandler(async (event) => {
        const exit = await Effect.runPromiseExit(
          Effect.gen(function* () {
            yield* Console.log(
              `[${event.method}]`,
              getRequestIP(event),
              event.path,
            );
            const wrappedHandler = Effect.functionWithSpan({
              body: handler as () => Effect.Effect<
                EventHandlerResponseType<Opts["config"]>,
                unknown,
                EventContext | EventParamsContext | R
              >,
              options: () => ({ name }),
            });
            return yield* effectType(
              config.response.type,
              yield* pipe(
                wrappedHandler(),
                Effect.provideService(EventContext, { event }),
                Effect.provideService(EventParamsContext, {
                  params: yield* effectEventHandlerParams(event, config),
                }),
                Effect.provide(
                  yield* pipe(
                    getEffectContext<R>(),
                    Effect.provide(effectContextLive),
                  ),
                ),
              ),
            );
          }),
        );
        if (Exit.isFailure(exit)) {
          const cause = exit.cause;
          if (
            Cause.isDieType(cause) &&
            Cause.isUnknownException(cause.defect)
          ) {
            Effect.runSync(
              Console.log("[die]", event.path, Cause.prettyErrors(cause)),
            );
            throw createError(cause.defect.message);
          } else if (Cause.isFailType(cause)) {
            const error = cause.error;
            if (
              isArktypeError(error) ||
              isFetchError(error) ||
              isS3Error(error)
            ) {
              Effect.runSync(
                Console.log("[fail]", event.path, Cause.prettyErrors(cause)),
              );
              throw createError(error.error?.message ?? "unknown error cause");
            }
          }
          Effect.runSync(
            Console.log("[fail]", event.path, Cause.prettyErrors(cause)),
          );
          throw createError(exit.toString());
        }
        return exit.value;
      }) as EffectEventHandler<
        EventHandlerResponseValidatorType<Opts["config"]>,
        Request
      >);
};

/*@__NO_SIDE_EFFECTS__*/
export const createEffectEventHandler = <R = never>() => {
  return <
    Stream extends boolean,
    Opts extends Stream extends true
      ? EffectStreamEventHandlerOptions<
          EventHandlerConfig<
            string,
            CoercedResponseType<type.Any, { stream: Stream }>
          >,
          R
        >
      : Stream extends false
        ? EffectEventHandlerOptions<
            EventHandlerConfig<
              string,
              CoercedResponseType<type.Any, { stream: Stream }>
            >,
            R
          >
        : never,
    Request extends EventHandlerRequest = EventHandlerRequest,
  >(
    options: Opts,
  ) => effectEventHandler<Stream, Opts, Request, R>(options);
};
