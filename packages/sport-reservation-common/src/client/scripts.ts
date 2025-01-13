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
  const { config } = await loadConfig<TheeStackConfig>({ name: "theestack" });
  return config;
};

const writeClient = async (config: TheeStackConfig) => {
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
      `import { apiRoutes } from "./routes.gen";`,
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

const writeMock = async (config: TheeStackConfig) => {
  await writeFile(
    ".theestack/mock.ts",
    [
      `import { createMockClient } from "sport-reservation-common/client/client";`,
      `import { ${pascalCase(`${config.name}_client`)} } from "./client";`,
      `import { apiRoutes } from "./routes.gen";`,
      ``,
      `export const ${camelCase(`create_mock_${config.name}_client`)} = () =>`,
      `  createMockClient(${pascalCase(`${config.name}_client`)}, apiRoutes);`,
    ].join("\n"),
  );
};

const writeModels = async (config: TheeStackConfig) => {
  await writeFile(
    ".theestack/models.ts",
    [
      `export * from "../server/models";`,
      `import { getClientResponseType, getClientQueryType, getClientBodyType, getClientRouterType } from "sport-reservation-common/client/client";`,
      `import { apiRoutes } from "./routes.gen";`,
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

const build = defineCommand({
  run: async () => {
    const config = await loadTheeStackConfig();
    await writeClient(config);
    await writeMock(config);
    await writeModels(config);
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
