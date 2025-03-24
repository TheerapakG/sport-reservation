import { Layer } from "effect";
import { matchingClient, oAuthClient } from "./client";
import { runtimeConfig } from "./config";

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () =>
  Layer.mergeAll(runtimeConfig).pipe(Layer.provide(runtimeConfig));

const configLive = createConfigLive();

const baseDependenciesLive = /*@__PURE__*/ Layer.mergeAll(configLive);

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () =>
  Layer.mergeAll(oAuthClient, matchingClient).pipe(
    Layer.provide(baseDependenciesLive),
  );

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  baseDependenciesLive,
  createClientLive(),
);
