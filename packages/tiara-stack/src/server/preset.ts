import { FSWatcher, watch } from "chokidar";
import { Effect, SynchronizedRef } from "effect";
import { glob } from "glob";
import type { NitroPreset } from "nitropack";
import path, { relative } from "pathe";
import type { RollupWatcher } from "rollup";
import { build } from "vite";
import { writeFile } from "~~/src/utils/writeFile";

const writeclientMethods = async (rootDir: string) => {
  const files = await glob(path.resolve(rootDir, "./client/methods/**/*.ts"));

  await writeFile(
    path.resolve(rootDir, "./.tiara/clientMethods.ts"),
    [
      ...files.map(
        (file, i) =>
          `import { methodConfig as methodConfig_${i}, default as method_${i} } from "../${relative(rootDir, file).replace(/\.(ts)$/, "")}"`,
      ),
      "",
      "export const clientMethods = {",
      ...files.map((_file, i) =>
        [
          `  [methodConfig_${i}["name"]]: {`,
          `    config: methodConfig_${i},`,
          `    method: method_${i},`,
          "  },",
        ].join("\n"),
      ),
      "} as const",
      "",
      "export type ClientMethods = typeof clientMethods",
      "",
    ].join("\n"),
  );
};

export const createPreset = (rootDir: string) => {
  const watchers = Effect.runSync(
    SynchronizedRef.make<
      | {
          vite: RollupWatcher;
          client: FSWatcher;
        }
      | undefined
    >(undefined),
  );

  return {
    ignore: ["**/*.test.ts"],
    alias: {
      $: path.resolve(rootDir, "./.tiara"),
    },
    typescript: {
      tsConfig: {
        compilerOptions: {
          paths: {
            "$/*": [path.resolve(rootDir, "./.tiara/*")],
          },
        },
      },
    },
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
          path.resolve(rootDir, "./.tiara/serverRoutes.ts"),
          [
            ...metadata.map(
              ({ importPath }, i) =>
                `import { handlerConfig as handlerConfig_${i} } from ${importPath}`,
            ),
            "",
            "export const apiRoutes = {",
            ...metadata.map(({ path, method }, i) =>
              [
                `  [handlerConfig_${i}["name"]]: {`,
                `    config: handlerConfig_${i},`,
                `    path: ${path},`,
                `    method: ${method},`,
                "  },",
              ].join("\n"),
            ),
            "} as const",
            "",
            "export type ApiRoutes = typeof apiRoutes",
            "",
          ].join("\n"),
        );
      },
      compiled: async (nitro) => {
        if (nitro.options.dev) {
          await Effect.runPromiseExit(
            SynchronizedRef.updateEffect(watchers, (watchers) =>
              Effect.tryPromise(async () => {
                if (!watchers) {
                  return {
                    vite: (await build({
                      build: { watch: {} },
                      mode: "development",
                    })) as RollupWatcher,
                    client: watch(path.resolve(rootDir, "./client")).on(
                      "all",
                      () => writeclientMethods(rootDir),
                    ),
                  };
                }
                return watchers;
              }),
            ),
          );
        } else {
          await writeclientMethods(rootDir);
        }
      },
      close: async () => {
        const unrefWatchers = Effect.runSync(SynchronizedRef.get(watchers));
        if (unrefWatchers) {
          await Promise.all([
            unrefWatchers.vite.close(),
            unrefWatchers.client.close(),
          ]);
        }
      },
    },
  } as NitroPreset;
};
