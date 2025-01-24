import { Effect, SynchronizedRef } from "effect";
import type { NitroPreset } from "nitropack";
import { build } from "vite";
import { writeFile } from "~~/src/utils/writeFile";

export const createPreset = () => {
  const ranViteWatcher = Effect.runSync(SynchronizedRef.make(false));

  return {
    ignore: ["**/*.test.ts"],
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
          "./.theestack/routes.ts",
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
            SynchronizedRef.updateEffect(ranViteWatcher, (ran) =>
              Effect.try(() => {
                if (!ran) {
                  build({ build: { watch: {} }, mode: "development" });
                }
                return true;
              }),
            ),
          );
      },
    },
  } as NitroPreset;
};
