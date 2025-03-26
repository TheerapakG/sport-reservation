import { Effect, Layer } from "effect";
import {
  EventFetch,
  eventClient as _eventClient,
  createEventFetch,
} from "sport-reservation-event/client";
import { RuntimeConfig } from "../config";

export const eventClient = /*@__PURE__*/ _eventClient.pipe(
  /*@__PURE__*/ Layer.provide(
    /*@__PURE__*/ Layer.effect(
      EventFetch,
      /*@__PURE__*/ Effect.gen(function* () {
        const config = yield* yield* RuntimeConfig;
        return EventFetch.of({
          fetch: createEventFetch({
            baseURL: config.event.baseUrl,
          }),
        });
      }),
    ),
  ),
);
