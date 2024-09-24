import { Layer } from "effect";
import {
  createEffectEventHandler,
  EffectEventHandlerOptions,
} from "sport-reservation-common/utils/effectEventHandler";
import { ofetch } from "ofetch";
import { Fetch } from "sport-reservation-common/utils/fetch";
import { authRepositoryImpl } from "~~/repositories/authRepositoryImpl";
import { downloadRepositoryImpl } from "~~/repositories/downloadRepositoryImpl";
import { uploadRepositoryImpl } from "~~/repositories/uploadRepositoryImpl";
import { EventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  Layer.mergeAll(
    authRepositoryImpl,
    downloadRepositoryImpl.pipe(
      Layer.provide(Layer.succeed(Fetch, { fetch: ofetch })),
    ),
    uploadRepositoryImpl.pipe(Layer.provide(s3Live)),
  );

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
