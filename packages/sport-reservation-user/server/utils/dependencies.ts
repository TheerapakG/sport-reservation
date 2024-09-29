import { Layer } from "effect";
import { userRepositoryImpl } from "~~/repositories/userRepositoryImpl";

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  userRepositoryImpl
    .pipe(Layer.provide(dbLive))
    .pipe(Layer.provide(runtimeConfig));

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () => Layer.empty;

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () => runtimeConfig;

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  createRepositoryLive(),
  createClientLive(),
  createConfigLive(),
);
