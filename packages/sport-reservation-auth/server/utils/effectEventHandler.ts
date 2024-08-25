import { Effect, Context, Exit, Cause, pipe } from "effect";
import { H3Event, EventHandlerRequest, EventHandlerResponse } from "h3";
import { LineLoginRepository } from "~~/repositories/lineLoginRepository";
import { lineLoginRepositoryImpl } from "~~/repositories/lineLoginRepositoryImpl";

export class Event extends Context.Tag("EventService")<
  Event,
  { event: Effect.Effect<H3Event<EventHandlerRequest>> }
>() {}

const repositoryContext = Context.empty().pipe(
  Context.add(LineLoginRepository, lineLoginRepositoryImpl),
);

export const effectEventHandler = <Response = EventHandlerResponse>(
  handler: Effect.Effect<Response, unknown, Event | LineLoginRepository>,
) =>
  eventHandler(async (event) => {
    const exit = await Effect.runPromiseExit(
      pipe(
        handler,
        Effect.provideService(Event, { event: Effect.succeed(event) }),
        Effect.provide(repositoryContext),
      ),
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
