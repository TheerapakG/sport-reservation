import { runtimeConfig } from "$/layers";
import { NodeFileSystem } from "@effect/platform-node";
import { Layer } from "effect";
import { dbLive, oAuthClient, uploadClient, userClient } from "~/layers";
import { assessmentDbRepositoryImpl } from "~/repositories/assessmentDbRepositoryImpl";
import { authRepositoryImpl } from "~/repositories/authRepositoryImpl";
import { matchingDbRepositoryImpl } from "~/repositories/matchingDbRepositoryImpl";

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
  Layer.mergeAll(
    authRepositoryImpl,
    assessmentDbRepositoryImpl,
    matchingDbRepositoryImpl,
  )
    .pipe(Layer.provide(dbLive))
    .pipe(Layer.provide(runtimeConfig));

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () =>
  Layer.mergeAll(oAuthClient, uploadClient, userClient).pipe(
    Layer.provide(baseDependenciesLive),
  );

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  baseDependenciesLive,
  createRepositoryLive(),
  createClientLive(),
);
