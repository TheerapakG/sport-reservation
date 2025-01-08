import { NodeFileSystem } from "@effect/platform-node";
import { Layer } from "effect";
import {
  authKey,
  dbLive,
  lineService,
  runtimeConfig,
  storageService,
  uploadClient,
  userClient,
} from "~/layers";
import { lineLoginApiRepositoryImpl } from "~/repositories/lineLoginApiRepositoryImpl";
import { lineLoginDbRepositoryImpl } from "~/repositories/lineLoginDbRepositoryImpl";

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () =>
  Layer.mergeAll(runtimeConfig, authKey).pipe(
    Layer.provide(runtimeConfig),
    Layer.provide(NodeFileSystem.layer),
  );

const configLive = createConfigLive();

/*@__NO_SIDE_EFFECTS__*/
const createExternalFetchLive = () =>
  lineService.pipe(Layer.provide(runtimeConfig));

const externalFetchLive = createExternalFetchLive();

/*@__NO_SIDE_EFFECTS__*/
const createOtherBaseDependenciesLive = () =>
  Layer.mergeAll(dbLive, storageService).pipe(Layer.provide(runtimeConfig));

const otherBaseDependenciesLive = createOtherBaseDependenciesLive();

const baseDependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  configLive,
  externalFetchLive,
  otherBaseDependenciesLive,
);

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  Layer.mergeAll(lineLoginApiRepositoryImpl, lineLoginDbRepositoryImpl).pipe(
    Layer.provide(baseDependenciesLive),
  );

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () =>
  Layer.mergeAll(userClient, uploadClient).pipe(
    Layer.provide(baseDependenciesLive),
  );

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  baseDependenciesLive,
  createRepositoryLive(),
  createClientLive(),
);
