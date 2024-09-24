import { Layer } from "effect";
import {
  createEffectEventHandler,
  EffectEventHandlerOptions,
} from "sport-reservation-common/utils/effectEventHandler";
import { userRepositoryImpl } from "~~/repositories/userRepositoryImpl";
import { dbLive } from "./layers/db";
import { EventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  Layer.mergeAll(userRepositoryImpl.pipe(Layer.provide(dbLive)));

const repositoryLive = createRepositoryLive();

const _effectEventHandler = /*@__PURE__*/ createEffectEventHandler({
  layer: repositoryLive,
});

/*@__NO_SIDE_EFFECTS__*/
export const effectEventHandler = <C extends EventHandlerConfig<string>>(
  opts: EffectEventHandlerOptions<
    C,
    Layer.Layer.Success<typeof repositoryLive>
  >,
) => _effectEventHandler(opts);
