import { Layer } from "effect";
import {
  createEffectEventHandler,
  EffectEventHandlerOptions,
} from "sport-reservation-common/utils/effectEventHandler";
import { EventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { lineLoginRepositoryImpl } from "~~/repositories/lineLoginRepositoryImpl.ts";
import { NodeFileSystem } from "@effect/platform-node";

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  Layer.mergeAll(lineLoginRepositoryImpl.pipe(Layer.provide(dbLive)));

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () => Layer.mergeAll(userClient, uploadClient);

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () =>
  Layer.mergeAll(authKey.pipe(Layer.provide(NodeFileSystem.layer)));

const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  createRepositoryLive(),
  createClientLive(),
  createConfigLive(),
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
