import { runtimeConfig } from "$/layers";
import { NodeFileSystem } from "@effect/platform-node";
import { Layer } from "effect";
import { dbLive, oAuthClient, uploadClient } from "~/layers";
import { authRepositoryImpl } from "~/repositories/authRepositoryImpl";
import { eventRepositoryImpl } from "~/repositories/eventRepositoryImpl";

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () =>
  Layer.mergeAll(runtimeConfig).pipe(
    Layer.provide(runtimeConfig),
    Layer.provide(NodeFileSystem.layer),
  );

const configLive = createConfigLive();

const baseDependenciesLive = /*@__PURE__*/ Layer.mergeAll(configLive);

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  Layer.mergeAll(authRepositoryImpl, eventRepositoryImpl).pipe(
    Layer.provide(dbLive),
    Layer.provide(runtimeConfig),
  );

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () =>
  Layer.mergeAll(oAuthClient, uploadClient).pipe(
    Layer.provide(baseDependenciesLive),
  );

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  baseDependenciesLive,
  createRepositoryLive(),
  createClientLive(),
);
