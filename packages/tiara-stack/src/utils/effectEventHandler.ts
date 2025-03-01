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
  EventHandlerResponseConfig,
  EventHandlerResponseType,
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

export type EffectEffectEventHandler<
  ResponseType = unknown,
  Request extends EventHandlerRequest = EventHandlerRequest,
> = EventHandler<Request, Promise<ResponseType>>;

export type EffectStreamEventHandler<
  Request extends EventHandlerRequest = EventHandlerRequest,
> = EventHandler<Request, Promise<ReadableStream<Uint8Array>>>;

export type EffectEffectEventHandlerType<
  ResponseType = unknown,
  R = never,
> = () => Effect.Effect<
  ResponseType,
  unknown,
  EventContext | EventParamsContext | R
>;

export type EffectStreamEventHandlerType<ResponseType = unknown, R = never> = (
  sourceStream: Stream.Stream<void>,
) => Stream.Stream<
  ResponseType,
  unknown,
  EventContext | EventParamsContext | R
>;

const getEffectContext = <R = never>() =>
  Effect.gen(function* () {
    const { latch, ref } = yield* EffectContext.typed<R>();
    yield* latch.await;
    return (yield* SynchronizedRef.get(ref)).context;
  });

export type EffectEventHandlerWrapper<
  C extends EventHandlerConfig<
    string,
    CoercedResponseType<type.Any, { stream: boolean }>
  >,
  ResponseConfig extends
    EventHandlerResponseConfig<C> = EventHandlerResponseConfig<C>,
  ResponseType extends
    EventHandlerResponseType<C> = EventHandlerResponseType<C>,
> = ResponseConfig extends { stream: true }
  ? <R = never>(
      handler: EffectStreamEventHandlerType<ResponseType, R>,
    ) => EffectStreamEventHandler<Request>
  : ResponseConfig extends { stream: false }
    ? <R = never>(
        handler: EffectEffectEventHandlerType<ResponseType, R>,
      ) => EffectEffectEventHandler<ResponseType, Request>
    : never;

const effectEventHandler = <
  C extends EventHandlerConfig<
    string,
    CoercedResponseType<type.Any, { stream: boolean }>
  >,
  R = never,
>(
  config: C,
): EffectEventHandlerWrapper<C> => {
  const {
    name,
    response: {
      type: responseType,
      config: { stream: responseStream },
    },
  } = config;

  return (responseStream
    ? (
        handler: EffectStreamEventHandlerType<
          C extends EventHandlerConfig<
            string,
            CoercedResponseType<type.Any, { stream: true }>
          >
            ? C
            : never,
          R
        >,
      ) =>
        eventHandler(async (event) => {
          setResponseHeader(event, "Content-Type", "application/octet-stream");
          setResponseHeader(event, "Cache-Control", "no-cache");
          setResponseHeader(event, "Transfer-Encoding", "chunked");

          const exit = await Effect.runPromiseExit(
            Effect.gen(function* () {
              yield* Console.log(
                `[${event.method}]`,
                getRequestIP(event),
                event.path,
              );

              const abort = yield* Effect.makeLatch();
              event.node.req.on("close", () => {
                Effect.runPromise(abort.open);
              });

              const sourceStream = Stream.void.pipe(
                Stream.flatMap((i) => Stream.repeatValue(i)),
                Stream.tap(() => Effect.yieldNow()),
                Stream.tap(() =>
                  Effect.promise(async () => {
                    await new Promise((resolve) => setTimeout(resolve, 0));
                  }),
                ),
                Stream.haltWhen(abort.await),
              );

              const handlerStream = pipe(
                handler(sourceStream),
                Stream.flatMap((item) =>
                  Stream.fromEffect(effectType(responseType, item)),
                ),
                Stream.map((item) => encode(item)),
                Stream.provideService(EventContext, { event }),
                Stream.provideService(EventParamsContext, {
                  params: yield* effectEventHandlerParams(event, config),
                }),
                Stream.provideContext(
                  yield* pipe(
                    getEffectContext<R>(),
                    Effect.provide(effectContextLive),
                  ),
                ),
              );

              return yield* Effect.functionWithSpan({
                body: () => Stream.toReadableStreamEffect(handlerStream),
                options: () => ({ name }),
              })();
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
                throw createError(
                  error.error?.message ?? "unknown error cause",
                );
              }
            }
            Effect.runSync(
              Console.log("[fail]", event.path, Cause.prettyErrors(cause)),
            );
            throw createError(exit.toString());
          }

          return exit.value;
        })
    : (
        handler: EffectEffectEventHandlerType<
          C extends EventHandlerConfig<
            string,
            CoercedResponseType<type.Any, { stream: false }>
          >
            ? C
            : never,
          R
        >,
      ) =>
        eventHandler(async (event) => {
          const exit = await Effect.runPromiseExit(
            Effect.gen(function* () {
              yield* Console.log(
                `[${event.method}]`,
                getRequestIP(event),
                event.path,
              );

              const handlerEffect = pipe(
                handler(),
                Effect.flatMap((item) => effectType(responseType, item)),
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
              );

              return yield* Effect.functionWithSpan({
                body: () => handlerEffect,
                options: () => ({ name }),
              })();
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
                throw createError(
                  error.error?.message ?? "unknown error cause",
                );
              }
            }
            Effect.runSync(
              Console.log("[fail]", event.path, Cause.prettyErrors(cause)),
            );
            throw createError(exit.toString());
          }
          return exit.value;
        })) as unknown as EffectEventHandlerWrapper<C>;
};

/*@__NO_SIDE_EFFECTS__*/
export const createEffectEventHandler = <R = never>() => {
  return <
    C extends EventHandlerConfig<
      string,
      CoercedResponseType<type.Any, { stream: boolean }>
    >,
  >(
    options: C,
  ) => effectEventHandler<C, R>(options);
};
