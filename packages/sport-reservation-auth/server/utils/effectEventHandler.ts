import { Layer } from "effect";
import {
  createEffectEventHandler,
  EffectEventHandlerOptions,
} from "sport-reservation-common/utils/effectEventHandler";
import { EventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { lineLoginRepositoryImpl } from "~~/repositories/lineLoginRepositoryImpl.ts";

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  Layer.mergeAll(lineLoginRepositoryImpl.pipe(Layer.provide(dbLive)));

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () => Layer.mergeAll(userClient, uploadClient);

const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  createRepositoryLive(),
  createClientLive(),
);

const _effectEventHandler = /*@__PURE__*/ createEffectEventHandler({
  layer: dependenciesLive,
});

/*@__NO_SIDE_EFFECTS__*/
export const effectEventHandler = <C extends EventHandlerConfig<string>>(
  opts: EffectEventHandlerOptions<
    C,
    Layer.Layer.Success<typeof dependenciesLive>
  >,
) => _effectEventHandler(opts);
