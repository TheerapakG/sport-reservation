import { Layer } from "effect";
import { lineLoginRepositoryImpl } from "~~/repositories/lineLoginRepositoryImpl.ts";
import { NodeFileSystem } from "@effect/platform-node";
import { authKey, runtimeConfig, uploadClient, userClient } from "./layers";

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  Layer.mergeAll(
    lineLoginRepositoryImpl.pipe(
      Layer.provide(runtimeConfig),
      Layer.provide(dbLive.pipe(Layer.provide(runtimeConfig))),
    ),
  );

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () =>
  Layer.mergeAll(
    userClient.pipe(Layer.provide(runtimeConfig)),
    uploadClient.pipe(Layer.provide(runtimeConfig)),
  );

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () =>
  Layer.mergeAll(
    runtimeConfig,
    authKey.pipe(
      Layer.provide(runtimeConfig),
      Layer.provide(NodeFileSystem.layer),
    ),
  );

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  createRepositoryLive(),
  createClientLive(),
  createConfigLive(),
);
