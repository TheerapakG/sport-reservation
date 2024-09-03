import { Type } from "arktype";
import { Effect, Context, Exit, Cause, pipe } from "effect";
import {
  eventHandler,
  H3Event,
  EventHandlerRequest,
  EventHandlerResponse,
  EventHandler,
} from "h3";
import { LineLoginRepository } from "~~/repositories/lineLoginRepository.ts";
import { lineLoginRepositoryImpl } from "~~/repositories/lineLoginRepositoryImpl.ts";

export class EventContext
  extends /*@__PURE__*/ Context.Tag("EventContext")<
    EventContext,
    { event: H3Event<EventHandlerRequest> }
  >() {}

const repositoryContext = /*@__PURE__*/ Context.empty().pipe(
  /*@__PURE__*/ Context.add(LineLoginRepository, lineLoginRepositoryImpl),
);

type EffectEventHandler<
  T = unknown,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  $ = {},
  Request extends EventHandlerRequest = EventHandlerRequest,
> = EventHandler<Request, Promise<Type<T, $>["infer"]>>;

/*@__NO_SIDE_EFFECTS__*/
export const effectEventHandler = <
  T = unknown,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  $ = {},
  Request extends EventHandlerRequest = EventHandlerRequest,
>({
  type,
  handler,
}: {
  type: Type<T, $>;
  handler: Effect.Effect<
    EventHandlerResponse<Type<T, $>["infer"]>,
    unknown,
    EventContext | LineLoginRepository
  >;
}): EffectEventHandler<T, $, Request> => {
  return eventHandler(async (event) => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        return yield* effectType(
          type,
          yield* pipe(
            handler,
            Effect.provideService(EventContext, { event }),
            Effect.provide(repositoryContext),
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
