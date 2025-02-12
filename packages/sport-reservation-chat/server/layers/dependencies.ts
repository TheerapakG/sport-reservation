import { runtimeConfig } from "$/layers";
import { NodeFileSystem } from "@effect/platform-node";
import { Layer } from "effect";
import { dbLive } from "~/layers";
import { chatRepositoryImpl } from "~/repositories/chatRepositoryImpl";

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
  Layer.mergeAll(chatRepositoryImpl)
    .pipe(Layer.provide(dbLive))
    .pipe(Layer.provide(runtimeConfig));

export const dependenciesLive = /*@__PURE__*/ Layer.mergeAll(
  baseDependenciesLive,
  createRepositoryLive(),
);
