import { Layer } from "effect";
import { userRepositoryImpl } from "~~/repositories/userRepositoryImpl";

/*@__NO_SIDE_EFFECTS__*/
const createRepositoryLive = () =>
  Layer.mergeAll(userRepositoryImpl.pipe(Layer.provide(dbLive)));

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () => Layer.empty;

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () => Layer.empty;

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  createRepositoryLive(),
  createClientLive(),
  createConfigLive(),
);
