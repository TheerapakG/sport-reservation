import redisDriver from "unstorage/drivers/redis";

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();

  useStorage().mount(
    "valkey",
    redisDriver({
      base: "sport-reservation:auth",
      host: config.valkey.host,
      port: config.valkey.port,
      password: config.valkey.password,
    }),
  );
});
