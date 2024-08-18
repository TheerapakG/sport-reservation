import { Effect, Context, Exit, Cause } from "effect";
import { H3Event, EventHandlerRequest, EventHandlerResponse } from "h3";

export class Event extends Context.Tag("EventService")<
  Event,
  { event: Effect.Effect<H3Event<EventHandlerRequest>> }
>() {}

export const effectEventHandler = <Response = EventHandlerResponse>(
  handler: Effect.Effect<Response, unknown, Event>
) =>
  eventHandler(async (event) => {
    const exit = await Effect.runPromiseExit(
      Effect.provideService(handler, Event, { event: Effect.succeed(event) })
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
