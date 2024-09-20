import { defu } from "defu";
import { Effect } from "effect";
import { Nitro, NitroConfig, NitroTypes } from "nitropack";
import fsp from "node:fs/promises";
import { dirname } from "pathe";
import { build } from "unbuild";

async function writeFile(file: string, contents: Buffer | string) {
  await fsp.mkdir(dirname(file), { recursive: true });
  await fsp.writeFile(
    file,
    contents,
    typeof contents === "string" ? "utf8" : undefined
  );
}

export const withClientHooks = (config: NitroConfig): NitroConfig => {
  return defu(config, {
    hooks: {
      "types:extend": async (types: NitroTypes) => {
        const metadata = Object.entries(types.routes).flatMap(
          ([path, methods]) =>
            Object.entries(methods).map(([method, types]) => {
              const importPath = types[0]
                .match(/import\((.*)\)/)?.[1]
                ?.replace("../../", "../");
              return {
                importPath: importPath,
                path: `"${path}"`,
                method: `"${method}"`,
              };
            })
        );

        await writeFile(
          "./client/routes.gen.ts",
          [
            ...metadata.map(
              ({ importPath }, i) =>
                `import { handlerName as handlerName_${i}, handlerType as handlerType_${i}, handlerQueryParams as handlerQueryParams_${i}, handlerRouterParams as handlerRouterParams_${i} } from ${importPath}`
            ),
            "export const authApiRoutes = {",
            ...metadata.map(({ path, method }, i) =>
              [
                `  [handlerName_${i}]: {`,
                `    type: handlerType_${i},`,
                `    queryParams: handlerQueryParams_${i},`,
                `    routerParams: handlerRouterParams_${i},`,
                `    path: ${path},`,
                `    method: ${method},`,
                "  },",
              ].join("\n")
            ),
            "} as const",
          ].join("\n")
        );
      },
      compiled: async (nitro: Nitro) => {
        if (nitro.options.dev)
          await Effect.runPromiseExit(
            Effect.tryPromise(async () => build(".", false))
          );
      },
    },
  });
};
