import { RuntimeConfig } from "$/layers";
import { KafkaJS } from "@confluentinc/kafka-javascript";
import { Context, Effect, Layer } from "effect";
import path from "pathe";

export class Kafka extends Context.Tag("Kafka")<
  Kafka,
  {
    kafka: KafkaJS.Kafka;
  }
>() {}

export const kafkaLive = /*@__PURE__*/ Layer.scoped(
  Kafka,
  /*@__PURE__*/ Effect.gen(function* () {
    const config = yield* yield* RuntimeConfig;

    const kafka = new KafkaJS.Kafka({
      "bootstrap.servers": config.kafka.bootstrapUrl,
      "security.protocol": "ssl",
      "ssl.key.location": path.join(config.secretPath, config.kafka.ssl.key),
      "ssl.certificate.location": path.join(
        config.secretPath,
        config.kafka.ssl.cert,
      ),
      "ssl.ca.location": path.join(config.secretPath, config.kafka.ssl.ca),
    });

    return {
      kafka,
    };
  }),
);
