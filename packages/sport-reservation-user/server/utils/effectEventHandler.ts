import { Layer } from "effect";
import {
  createEffectEventHandler,
  EffectEventHandlerOptions,
} from "sport-reservation-common/utils/effectEventHandler";
import { EventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";

const _effectEventHandler =
  /*@__PURE__*/ createEffectEventHandler<
    Layer.Layer.Success<typeof dependenciesLive>
  >();

/*@__NO_SIDE_EFFECTS__*/
export const effectEventHandler = <C extends EventHandlerConfig<string>>(
  opts: EffectEventHandlerOptions<
    C,
    Layer.Layer.Success<typeof dependenciesLive>
  >,
) => _effectEventHandler(opts);
