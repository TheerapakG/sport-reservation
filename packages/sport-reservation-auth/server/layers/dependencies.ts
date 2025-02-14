import { runtimeConfig } from "$/layers";
import { NodeFileSystem } from "@effect/platform-node";
import { Layer } from "effect";
import { dbLive, oAuthClient } from "~/layers";
import { authRepositoryImpl } from "~/repositories/authRepositoryImpl";
import { googleLoginDbRepositoryImpl } from "~/repositories/googleLoginDbRepositoryImpl";
import { lineLoginDbRepositoryImpl } from "~/repositories/lineLoginDbRepositoryImpl";

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () =>
  Layer.mergeAll(runtimeConfig).pipe(
    Layer.provide(runtimeConfig),
    Layer.provide(NodeFileSystem.layer),
  );

const configLive = createConfigLive();

/*@__NO_SIDE_EFFECTS__*/
const createOtherBaseDependenciesLive = () =>
  Layer.mergeAll(dbLive).pipe(Layer.provide(runtimeConfig));

const otherBaseDependenciesLive = createOtherBaseDependenciesLive();

const baseDependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  configLive,
  otherBaseDependenciesLive,
);

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  Layer.mergeAll(
    authRepositoryImpl,
    googleLoginDbRepositoryImpl,
    lineLoginDbRepositoryImpl,
  ).pipe(Layer.provide(baseDependenciesLive));

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () =>
  Layer.mergeAll(oAuthClient).pipe(Layer.provide(baseDependenciesLive));

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  baseDependenciesLive,
  createRepositoryLive(),
  createClientLive(),
);
