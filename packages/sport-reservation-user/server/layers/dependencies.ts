import { runtimeConfig } from "$/layers";
import { Layer } from "effect";
import { dbLive, uploadClient } from "~/layers";
import { userRepositoryImpl } from "~/repositories/userRepositoryImpl";

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () => runtimeConfig;

const configLive = createConfigLive();

const baseDependenciesLive = /*@__PURE__*/ Layer.mergeAll(configLive);

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  userRepositoryImpl
    .pipe(Layer.provide(dbLive))
    .pipe(Layer.provide(runtimeConfig));

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () =>
  Layer.mergeAll(uploadClient).pipe(Layer.provide(baseDependenciesLive));

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  baseDependenciesLive,
  createRepositoryLive(),
  createClientLive(),
);
