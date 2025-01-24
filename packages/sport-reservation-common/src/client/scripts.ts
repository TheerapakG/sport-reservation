import { loadConfig } from "c12";
import { defineCommand } from "citty";
import {
  build as buildNitro,
  copyPublicAssets,
  createNitro,
  prepare,
  prerender,
  scanHandlers,
  writeTypes,
} from "nitropack";
import { camelCase, pascalCase } from "scule";
import { build as viteBuild } from "vite";
import { TheeStackConfig } from "~~/src/utils/theeStackConfig";
import { writeFile } from "~~/src/utils/writeFile";

const loadTheeStackConfig = async () => {
  const { config } = await loadConfig<TheeStackConfig<never>>({
    name: "theestack",
  });
  return config;
};

const writeClient = async (config: TheeStackConfig<never>) => {
  await writeFile(
    ".theestack/client.ts",
    [
      `import { Context } from "effect";`,
      `import {`,
      `  Client,`,
      `  createClient,`,
      `  createFetch,`,
      `} from "sport-reservation-common/client/client";`,
      `import { Fetch } from "sport-reservation-common/utils/fetch";`,
      `import { apiRoutes } from "./routes";`,
      ``,
      `export { Fetch as ${pascalCase(`${config.name}_fetch`)} };`,
      ``,
      `export const ${camelCase(`create_${config.name}_fetch`)} = createFetch;`,
      ``,
      `export class ${pascalCase(`${config.name}_client`)} extends Context.Tag("${pascalCase(`${config.name}_client`)}")<`,
      `  ${pascalCase(`${config.name}_client`)},`,
      `  Client<typeof apiRoutes>`,
      `>() {}`,
      ``,
      `export const ${camelCase(`${config.name}_client`)} = createClient(${pascalCase(`${config.name}_client`)}, apiRoutes);`,
      ``,
    ].join("\n"),
  );
};

const writeMock = async (config: TheeStackConfig<never>) => {
  await writeFile(
    ".theestack/mock.ts",
    [
      `import { createMockClient } from "sport-reservation-common/client/client";`,
      `import { ${pascalCase(`${config.name}_client`)} } from "./client";`,
      `import { apiRoutes } from "./routes";`,
      ``,
      `export const ${camelCase(`create_mock_${config.name}_client`)} = () =>`,
      `  createMockClient(${pascalCase(`${config.name}_client`)}, apiRoutes);`,
    ].join("\n"),
  );
};

const writeModels = async (config: TheeStackConfig<never>) => {
  await writeFile(
    ".theestack/models.ts",
    [
      `export * from "~/models";`,
      `import { getClientResponseType, getClientQueryType, getClientBodyType, getClientRouterType } from "sport-reservation-common/client/client";`,
      `import { apiRoutes } from "./routes";`,
      ``,
      `export const ${camelCase(`get_${config.name}_client_response_type`)} = <K extends keyof typeof apiRoutes>(name: K) =>`,
      `  getClientResponseType(apiRoutes, name);`,
      ``,
      `export const ${camelCase(`get_${config.name}_client_query_type`)} = <K extends keyof typeof apiRoutes>(name: K) =>`,
      `  getClientQueryType(apiRoutes, name);`,
      ``,
      `export const ${camelCase(`get_${config.name}_client_body_type`)} = <K extends keyof typeof apiRoutes>(name: K) =>`,
      `  getClientBodyType(apiRoutes, name);`,
      ``,
      `export const ${camelCase(`get_${config.name}_client_router_type`)} = <K extends keyof typeof apiRoutes>(name: K) =>`,
      `  getClientRouterType(apiRoutes, name);`,
    ].join("\n"),
  );
};

const writeRuntimeConfig = async () => {
  await writeFile(
    ".theestack/layers/config/runtimeConfig.ts",
    [
      `import { Config, Context, Layer } from "effect";`,
      `import {`,
      `  effectConfig,`,
      `  InferConfig,`,
      `} from "sport-reservation-common/utils/effectConfig";`,
      `import { default as theeStackConfig } from "~~/theestack.config.ts";`,
      ``,
      `/*@__NO_SIDE_EFFECTS__*/`,
      `const createConfigShape = () => {`,
      `  return theeStackConfig.runtimeConfig;`,
      `};`,
      ``,
      `export class RuntimeConfig`,
      `  extends /*@__PURE__*/ Context.Tag("RuntimeConfig")<`,
      `    RuntimeConfig,`,
      `    Config.Config<InferConfig<ReturnType<typeof createConfigShape>>>`,
      `  >() {}`,
      ``,
      `export const runtimeConfig = /*@__PURE__*/ Layer.effect(`,
      `  RuntimeConfig,`,
      `  /*@__PURE__*/ effectConfig(createConfigShape()),`,
      `);`,
    ].join("\n"),
  );
};

const writeLayers = async () => {
  await writeFile(
    ".theestack/layers/index.ts",
    [`export * from "./config/runtimeConfig";`].join("\n"),
  );
};

const writeEffectEventHandler = async () => {
  await writeFile(
    ".theestack/effectEventHandler.ts",
    [
      `import { Layer } from "effect";`,
      `import {`,
      `  createEffectEventHandler,`,
      `  EffectEventHandlerOptions,`,
      `} from "sport-reservation-common/utils/effectEventHandler";`,
      `import { EventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";`,
      `export { EventContext, EventParamsContext } from "sport-reservation-common/utils/effectEventHandler";`,
      ``,
      `import { dependenciesLive } from "~/layers/dependencies";`,
      ``,
      `const _effectEventHandler =`,
      `  /*@__PURE__*/ createEffectEventHandler<`,
      `    Layer.Layer.Success<typeof dependenciesLive>`,
      `  >();`,
      ``,
      `/*@__NO_SIDE_EFFECTS__*/`,
      `export const effectEventHandler = <C extends EventHandlerConfig<string>>(`,
      `  opts: EffectEventHandlerOptions<`,
      `    C,`,
      `    Layer.Layer.Success<typeof dependenciesLive>`,
      `  >,`,
      `) => _effectEventHandler(opts);`,
    ].join("\n"),
  );
};

const writeIndex = async () => {
  await writeFile(
    ".theestack/index.ts",
    [`export * from "./.theestack/effectEventHandler";`].join("\n"),
  );
};

const build = defineCommand({
  run: async () => {
    const config = await loadTheeStackConfig();
    await writeClient(config);
    await writeMock(config);
    await writeModels(config);
    await writeRuntimeConfig();
    await writeLayers();
    await writeEffectEventHandler();
    await writeIndex();
    const nitro = await createNitro({ rootDir: ".", dev: false });
    await prepare(nitro);
    await copyPublicAssets(nitro);
    await prerender(nitro);
    await buildNitro(nitro);
    await nitro.close();
    await viteBuild();
  },
});

const generate = defineCommand({
  run: async () => {
    const config = await loadTheeStackConfig();
    await writeClient(config);
    await writeMock(config);
    await writeModels(config);
    await writeRuntimeConfig();
    await writeLayers();
    await writeEffectEventHandler();
    await writeIndex();
    const nitro = await createNitro({ rootDir: ".", dev: false });
    await prepare(nitro);
    await scanHandlers(nitro);
    await writeTypes(nitro);
    await nitro.close();
    await viteBuild();
  },
});

export const main = defineCommand({
  subCommands: {
    build,
    generate,
  },
});
