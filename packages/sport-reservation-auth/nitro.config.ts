import fsp from "node:fs/promises";
import { dirname } from "pathe";
import { build } from "unbuild";

export async function writeFile(file: string, contents: Buffer | string) {
  await fsp.mkdir(dirname(file), { recursive: true });
  await fsp.writeFile(
    file,
    contents,
    typeof contents === "string" ? "utf8" : undefined,
  );
}

//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  runtimeConfig: {
    postgresUrl: "NITRO_POSTGRES_URL",
    valkey: {
      host: "NITRO_VALKEY_HOST",
      port: "NITRO_VALKEY_PORT",
      password: "NITRO_VALKEY_PASSWORD",
    },
    line: {
      clientId: "NITRO_LINE_CLIENT_ID",
      redirectUri: "NITRO_LINE_REDIRECT_URI",
    },
  },
  hooks: {
    "types:extend": async (types) => {
      await writeFile(
        "./routes.ts",
        [
          "import { Simplify, Serialize } from 'nitropack'",
          "export type AuthApiTypes = {",
          ...Object.entries(types.routes).map(([path, methods]) =>
            [
              `  '${path}': {`,
              ...Object.entries(methods).map(
                ([method, types]) =>
                  `    '${method}': ${types
                    .map(
                      (type) =>
                        `Simplify<Serialize<typeof ${type
                          .match(/(import\(.*\))/)?.[1]
                          ?.replace("../../", "./")
                          ?.replace(".default", "")}.handlerType.infer>>`,
                    )
                    .join(" | ")}`,
              ),
              "  },",
            ].join("\n"),
          ),
          "}",
          "export const authApiRoutes = async () => {",
          "  return {",
          ...Object.entries(types.routes).map(([path, methods]) =>
            [
              `    '${path}': {`,
              ...Object.entries(methods).map(
                ([method, types]) =>
                  `      '${method}': [${types.map((type) => `(await ${type.match(/(import\(.*\))/)?.[1]?.replace("../../", "./")}).handlerType`).join(", ")}] as const`,
              ),
              "    },",
            ].join("\n"),
          ),
          "  }",
          "}",
        ].join("\n"),
      );
    },
    compiled: async (nitro) => {
      if (nitro.options.dev) await build(".", true);
    },
  },
});
