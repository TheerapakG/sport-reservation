import type { NitroPreset } from "nitropack";
import { Effect } from "effect";
import fsp from "node:fs/promises";
import { dirname } from "pathe";
import { build } from "unbuild";

async function writeFile(file: string, contents: Buffer | string) {
  await fsp.mkdir(dirname(file), { recursive: true });
  await fsp.writeFile(
    file,
    contents,
    typeof contents === "string" ? "utf8" : undefined,
  );
}

export const createPreset = () => {
  return {
    hooks: {
      "types:extend": async (types) => {
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
            }),
        );

        await writeFile(
          "./client/routes.gen.ts",
          [
            ...metadata.map(
              ({ importPath }, i) =>
                `import { handlerConfig as handlerConfig_${i} } from ${importPath}`,
            ),
            "export const apiRoutes = {",
            ...metadata.map(({ path, method }, i) =>
              [
                `  [handlerConfig_${i}["name"]]: {`,
                `    response: handlerConfig_${i}["response"],`,
                `    query: handlerConfig_${i}["query"],`,
                `    body: handlerConfig_${i}["body"],`,
                `    router: handlerConfig_${i}["router"],`,
                `    path: ${path},`,
                `    method: ${method},`,
                "  },",
              ].join("\n"),
            ),
            "} as const",
          ].join("\n"),
        );
      },
      compiled: async (nitro) => {
        if (nitro.options.dev)
          await Effect.runPromiseExit(
            Effect.tryPromise(async () => build(".", false)),
          );
      },
    },
  } as NitroPreset;
};
