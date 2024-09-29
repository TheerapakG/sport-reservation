import { Layer } from "effect";
import { ofetch } from "ofetch";
import { Fetch } from "sport-reservation-common/utils/fetch";
import { authRepositoryImpl } from "~~/repositories/authRepositoryImpl";
import { downloadRepositoryImpl } from "~~/repositories/downloadRepositoryImpl";
import { uploadRepositoryImpl } from "~~/repositories/uploadRepositoryImpl";

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  Layer.mergeAll(
    authRepositoryImpl,
    downloadRepositoryImpl.pipe(
      Layer.provide(Layer.succeed(Fetch, { fetch: ofetch })),
    ),
    uploadRepositoryImpl.pipe(Layer.provide(s3Live)),
  ).pipe(Layer.provide(runtimeConfig));

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () => Layer.empty;

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () => runtimeConfig;

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  createRepositoryLive(),
  createClientLive(),
  createConfigLive(),
);
