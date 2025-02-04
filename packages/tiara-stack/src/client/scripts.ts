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
import { TiaraConfig } from "~~/src/config/tiaraConfig";
import { writeFile } from "~~/src/utils/writeFile";

const loadTiaraConfig = async () => {
  const { config } = await loadConfig<TiaraConfig<never>>({
    name: "tiara",
  });
  return config;
};

type TiaraContent = string | TiaraContentMap;
interface TiaraContentMap extends Record<string, TiaraContent> {}

const createTiaraContents = (config: TiaraConfig<never>): TiaraContentMap => {
  return {
    client: [
      `import { Context } from "effect";`,
      `import {`,
      `  Client,`,
      `  createClient,`,
      `  createFetch,`,
      `} from "tiara-stack/client/client";`,
      `import { Fetch } from "tiara-stack/utils/fetch";`,
      `import { apiRoutes, type ApiRoutes } from "./serverRoutes";`,
      `import { clientMethods, type ClientMethods } from "./clientMethods";`,
      ``,
      `export { Fetch as ${pascalCase(`${config.name}_fetch`)} };`,
      ``,
      `export const ${camelCase(`create_${config.name}_fetch`)} = createFetch;`,
      ``,
      `export class ${pascalCase(`${config.name}_client`)} extends Context.Tag("${pascalCase(`${config.name}_client`)}")<`,
      `  ${pascalCase(`${config.name}_client`)},`,
      `  Client<ApiRoutes, ClientMethods>`,
      `>() {}`,
      ``,
      `export const ${camelCase(`${config.name}_client`)} = createClient(${pascalCase(`${config.name}_client`)}, apiRoutes, clientMethods);`,
      ``,
    ].join("\n"),
    effectEventHandler: [
      `import { Layer } from "effect";`,
      `import {`,
      `  createEffectEventHandler,`,
      `  EffectEventHandlerOptions,`,
      `} from "tiara-stack/utils/effectEventHandler";`,
      `import { EventHandlerConfig } from "tiara-stack/config";`,
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
      ``,
      `export { EventContext, EventParamsContext } from "tiara-stack/utils/effectEventHandler";`,
      ``,
    ].join("\n"),
    mock: [
      `import { createMockClient } from "tiara-stack/client/client";`,
      `import { ${pascalCase(`${config.name}_client`)} } from "./client";`,
      `import { apiRoutes } from "./serverRoutes";`,
      `import { clientMethods } from "./clientMethods";`,
      ``,
      `export const ${camelCase(`create_mock_${config.name}_client`)} = () =>`,
      `  createMockClient(${pascalCase(`${config.name}_client`)}, apiRoutes, clientMethods);`,
      ``,
    ].join("\n"),
    models: [
      `export * from "~/models";`,
      `import { getClientResponseType, getClientQueryType, getClientBodyType, getClientRouterType } from "tiara-stack/client/client";`,
      `import { apiRoutes, type ApiRoutes } from "./serverRoutes";`,
      ``,
      `export const ${camelCase(`get_${config.name}_client_response_type`)} = <K extends keyof ApiRoutes>(name: K) =>`,
      `  getClientResponseType(apiRoutes, name);`,
      ``,
      `export const ${camelCase(`get_${config.name}_client_query_type`)} = <K extends keyof ApiRoutes>(name: K) =>`,
      `  getClientQueryType(apiRoutes, name);`,
      ``,
      `export const ${camelCase(`get_${config.name}_client_body_type`)} = <K extends keyof ApiRoutes>(name: K) =>`,
      `  getClientBodyType(apiRoutes, name);`,
      ``,
      `export const ${camelCase(`get_${config.name}_client_router_type`)} = <K extends keyof ApiRoutes>(name: K) =>`,
      `  getClientRouterType(apiRoutes, name);`,
      ``,
    ].join("\n"),
    index: [`export * from "./effectEventHandler";`, ``].join("\n"),
    layers: {
      config: {
        runtimeConfig: [
          `import { Config, Context, Layer } from "effect";`,
          `import {`,
          `  effectConfig,`,
          `  InferConfig,`,
          `} from "tiara-stack/config";`,
          `import { default as tiaraConfig } from "~~/tiara.config.ts";`,
          ``,
          `/*@__NO_SIDE_EFFECTS__*/`,
          `const createConfigShape = () => {`,
          `  return tiaraConfig.runtimeConfig;`,
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
          ``,
        ].join("\n"),
      },
      index: [`export * from "./config/runtimeConfig";`, ``].join("\n"),
    },
  };
};

const writeObject = async (path: string, contents: TiaraContentMap) => {
  for (const [key, content] of Object.entries(contents)) {
    if (typeof content === "string") {
      await writeFile(`${path}/${key}.ts`, content);
    } else {
      await writeObject(`${path}/${key}`, content);
    }
  }
};

const writeTiaraContent = async (config: TiaraConfig<never>) => {
  const contents = createTiaraContents(config);
  await writeObject(".tiara", contents);
};

const init = defineCommand({
  run: async () => {
    const config = await loadTiaraConfig();
    await writeTiaraContent(config);
  },
});

const generate = defineCommand({
  run: async () => {
    const config = await loadTiaraConfig();
    await writeTiaraContent(config);
    const nitro = await createNitro({ rootDir: ".", dev: false });
    await prepare(nitro);
    await scanHandlers(nitro);
    await writeTypes(nitro);
    await nitro.hooks.callHook("compiled", nitro);
    await nitro.close();
    await viteBuild();
  },
});

const build = defineCommand({
  run: async () => {
    const config = await loadTiaraConfig();
    await writeTiaraContent(config);
    const nitro = await createNitro({ rootDir: ".", dev: false });
    await prepare(nitro);
    await copyPublicAssets(nitro);
    await prerender(nitro);
    await buildNitro(nitro);
    await nitro.close();
    await viteBuild();
  },
});

export const main = defineCommand({
  subCommands: {
    build,
    generate,
    init,
  },
});
