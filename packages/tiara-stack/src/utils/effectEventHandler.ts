import { encode } from "@msgpack/msgpack";
import { type } from "arktype";
import { Cause, Console, Context, Effect, Exit, pipe, Stream } from "effect";
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
import { EventHandlerConfig } from "~~/src/config/eventHandlerConfig";
import {
  CoercedResponseType,
  FetchResponseConfig,
  FetchResponseType,
  FetchResponseValidatorType,
  FetchTypeConfig,
} from "~~/src/config/fetchConfig";
import { ArktypeError, isBaseError } from "~~/src/models/errors";
import { EffectContext, getInnerContext } from "~~/src/server/effectContext";
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
  public static typed<C extends FetchTypeConfig = FetchTypeConfig>() {
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
) => Effect.Effect<
  Stream.Stream<ResponseType, unknown, EventContext | EventParamsContext | R>,
  unknown,
  EventContext | EventParamsContext | R
>;

export type EffectStreamEventHandlerWrapper<
  ResponseType = unknown,
  R = never,
> = (
  handler: EffectStreamEventHandlerType<ResponseType, R>,
) => EffectStreamEventHandler<Request>;

export type EffectEffectEventHandlerWrapper<
  ResponseType = unknown,
  R = never,
> = (
  handler: EffectEffectEventHandlerType<ResponseType, R>,
) => EffectEffectEventHandler<ResponseType, Request>;

export type EffectEventHandlerWrapper<
  C extends EventHandlerConfig<
    string,
    CoercedResponseType<type.Any, { stream: boolean }>
  >,
  R = never,
  ResponseConfig extends FetchResponseConfig<C> = FetchResponseConfig<C>,
  ResponseType extends FetchResponseType<C> = FetchResponseType<C>,
> = ResponseConfig extends infer _ResponseConfig
  ? _ResponseConfig extends { stream: true }
    ? EffectStreamEventHandlerWrapper<ResponseType, R>
    : _ResponseConfig extends { stream: false }
      ? EffectEffectEventHandlerWrapper<ResponseType, R>
      : never
  : never;

const handlerContext = <Services>(
  effectContext: EffectContext<Services>,
  event: H3Event<EventHandlerRequest>,
  config: EventHandlerConfig<
    string,
    CoercedResponseType<type.Any, { stream: boolean }>
  >,
): Effect.Effect<
  Context.Context<EventContext | EventParamsContext | Services>,
  ArktypeError
> =>
  Effect.gen(function* () {
    return Context.empty().pipe(
      Context.add(EventContext, { event }),
      Context.add(EventParamsContext, {
        params: yield* effectEventHandlerParams(event, config),
      }),
      Context.merge(yield* getInnerContext(effectContext)),
    );
  });

const handleOrThrowEffect = async <A, E = never>(
  effect: Effect.Effect<A, E>,
) => {
  const exit = await Effect.runPromiseExit(effect);

  if (Exit.isFailure(exit)) {
    const cause = exit.cause;

    if (Cause.isDieType(cause) && Cause.isUnknownException(cause.defect)) {
      Effect.runSync(Console.log("[die]", Cause.prettyErrors(cause)));
      throw createError(cause.defect.message);
    } else if (Cause.isFailType(cause)) {
      const error = cause.error;
      if (isBaseError(error)) {
        Effect.runSync(Console.log("[fail]", Cause.prettyErrors(cause)));
        throw createError(error.error?.message ?? "unknown error cause");
      }
    }
    Effect.runSync(Console.log("[fail]", Cause.prettyErrors(cause)));
    throw createError(exit.toString());
  }

  return exit.value;
};

const effectStreamEventHandler = <
  Services,
  C extends EventHandlerConfig<
    string,
    CoercedResponseType<type.Any, { stream: true }>
  >,
  R extends Services = never,
  ResponseValidatorType extends
    FetchResponseValidatorType<C> = FetchResponseValidatorType<C>,
  ResponseType extends FetchResponseType<C> = FetchResponseType<C>,
>(
  effectContext: EffectContext<Services>,
  config: C,
): EffectStreamEventHandlerWrapper<ResponseType, R> => {
  const {
    name,
    response: { type: responseType },
  } = config;

  return (handler) =>
    eventHandler(async (event) => {
      setResponseHeader(event, "Content-Type", "application/octet-stream");
      setResponseHeader(event, "Cache-Control", "no-cache");
      setResponseHeader(event, "Transfer-Encoding", "chunked");

      return await handleOrThrowEffect(
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
            Stream.fromEffect(handler(sourceStream)),
            Stream.flatMap((s) => s),
            Stream.flatMap((item) =>
              Stream.fromEffect(
                effectType(responseType as ResponseValidatorType, item),
              ),
            ),
            Stream.map((item) => encode(item)),
            Stream.provideContext(
              yield* handlerContext(effectContext, event, config),
            ),
          );

          return yield* Effect.functionWithSpan({
            body: () => Stream.toReadableStreamEffect(handlerStream),
            options: () => ({ name }),
          })();
        }),
      );
    }) as EffectStreamEventHandler<Request>;
};

const effectEffectEventHandler =
  <
    Services,
    C extends EventHandlerConfig<
      string,
      CoercedResponseType<type.Any, { stream: false }>
    >,
    R extends Services = never,
    ResponseValidatorType extends
      FetchResponseValidatorType<C> = FetchResponseValidatorType<C>,
    ResponseType extends FetchResponseType<C> = FetchResponseType<C>,
  >(
    effectContext: EffectContext<Services>,
    config: C,
  ): EffectEffectEventHandlerWrapper<ResponseType, R> =>
  (handler) => {
    const {
      name,
      response: { type: responseType },
    } = config;

    return eventHandler(async (event) => {
      return await handleOrThrowEffect(
        Effect.gen(function* () {
          yield* Console.log(
            `[${event.method}]`,
            getRequestIP(event),
            event.path,
          );

          const handlerEffect = pipe(
            handler(),
            Effect.flatMap((item) =>
              effectType(responseType as ResponseValidatorType, item),
            ),
            Effect.provide(yield* handlerContext(effectContext, event, config)),
          );

          return yield* Effect.functionWithSpan({
            body: () => handlerEffect,
            options: () => ({ name }),
          })();
        }),
      );
    });
  };

const effectEventHandler = <
  Services,
  C extends EventHandlerConfig<
    string,
    CoercedResponseType<type.Any, { stream: boolean }>
  >,
  R extends Services = never,
>(
  effectContext: EffectContext<Services>,
  config: C,
): EffectEventHandlerWrapper<C, R> => {
  return (
    config.response.config.stream
      ? effectStreamEventHandler(
          effectContext,
          config as C & { response: { config: { stream: true } } },
        )
      : effectEffectEventHandler(
          effectContext,
          config as C & { response: { config: { stream: false } } },
        )
  ) as EffectEventHandlerWrapper<C, R>;
};

/*@__NO_SIDE_EFFECTS__*/
export const createEffectEventHandler = <Services>(
  effectContext: EffectContext<Services>,
) => {
  return <
    C extends EventHandlerConfig<
      string,
      CoercedResponseType<type.Any, { stream: boolean }>
    >,
    R extends Services = never,
  >(
    options: C,
  ) => effectEventHandler<Services, C, R>(effectContext, options);
};
