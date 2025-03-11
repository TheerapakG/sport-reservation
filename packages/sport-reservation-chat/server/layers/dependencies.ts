import { runtimeConfig } from "$/layers";
import { NodeFileSystem } from "@effect/platform-node";
import { Layer } from "effect";
import {
  dbLive,
  kafkaLive,
  oAuthClient,
  uploadClient,
  userClient,
} from "~/layers";
import { chatDbRepositoryImpl } from "~/repositories/chatDbRepositoryImpl";
import { chatRepositoryImpl } from "~/repositories/chatRepositoryImpl";
import { kafkaPartitionedPubSubImpl } from "~/repositories/kafkaPartitionedPubSubImpl";

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
    .pipe(Layer.provideMerge(chatDbRepositoryImpl))
    .pipe(
      Layer.provide(
        kafkaPartitionedPubSubImpl({
          groupId: "sport-reservation-chat",
          topic: "sport-reservation.chat.message",
        }),
      ),
    )
    .pipe(Layer.provide(Layer.mergeAll(dbLive, kafkaLive)))
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
