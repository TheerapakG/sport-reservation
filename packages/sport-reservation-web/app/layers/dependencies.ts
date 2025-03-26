import { Layer } from "effect";
import {
  clubClient,
  eventClient,
  friendClient,
  matchingClient,
  oAuthClient,
  userClient,
} from "./client";
import { runtimeConfig } from "./config";

/*@__NO_SIDE_EFFECTS__*/
const createConfigLive = () =>
  Layer.mergeAll(runtimeConfig).pipe(Layer.provide(runtimeConfig));

const configLive = createConfigLive();

const baseDependenciesLive = /*@__PURE__*/ Layer.mergeAll(configLive);

/*@__NO_SIDE_EFFECTS__*/
const createClientLive = () =>
  Layer.mergeAll(
    oAuthClient,
    matchingClient,
    userClient,
    friendClient,
    clubClient,
    eventClient,
  ).pipe(Layer.provide(baseDependenciesLive));

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  baseDependenciesLive,
  createClientLive(),
);
