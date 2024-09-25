import { Layer } from "effect";
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

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  createRepositoryLive(),
  createClientLive(),
  createConfigLive(),
);
