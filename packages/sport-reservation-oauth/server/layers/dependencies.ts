import { runtimeConfig } from "$/layers";
import { Layer } from "effect";
import {
  dbLive,
  facebookService,
  googleService,
  lineService,
  mockStorageService,
} from ".";
import { authClient, uploadClient, userClient } from "./client";
import { issuerLive } from "./issuer";

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () => runtimeConfig;

const configLive = createConfigLive();

/*@__NO_SIDE_EFFECTS__*/
const createExternalFetchLive = () =>
  Layer.mergeAll(lineService, googleService, facebookService).pipe(
    Layer.provide(runtimeConfig),
  );

const externalFetchLive = createExternalFetchLive();

/*@__NO_SIDE_EFFECTS__*/
const createOtherBaseDependenciesLive = () =>
  Layer.mergeAll(dbLive, mockStorageService).pipe(Layer.provide(runtimeConfig));

const otherBaseDependenciesLive = createOtherBaseDependenciesLive();

const baseDependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  configLive,
  externalFetchLive,
  otherBaseDependenciesLive,
);

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () =>
  Layer.mergeAll(authClient, userClient, uploadClient).pipe(
    Layer.provide(baseDependenciesLive),
  );

export const dependenciesLive = /*@__PURE__*/ issuerLive.pipe(
  Layer.provideMerge(Layer.mergeAll(baseDependenciesLive, createClientLive())),
);
