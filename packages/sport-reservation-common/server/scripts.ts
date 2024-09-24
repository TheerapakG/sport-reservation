import { defineCommand, runMain } from "citty";
import {
  build as buildNitro,
  copyPublicAssets,
  createNitro,
  prepare,
  prerender,
  scanHandlers,
  writeTypes,
} from "nitropack";
import { build as unbuild } from "unbuild";

const build = defineCommand({
  run: async () => {
    const nitro = await createNitro({ rootDir: ".", dev: false });
    await prepare(nitro);
    await copyPublicAssets(nitro);
    await prerender(nitro);
    await buildNitro(nitro);
    await nitro.close();
    await unbuild(".", false);
  },
});

const generate = defineCommand({
  run: async () => {
    const nitro = await createNitro({ rootDir: ".", dev: false });
    await prepare(nitro);
    await scanHandlers(nitro);
    await writeTypes(nitro);
    await nitro.close();
    await unbuild(".", false);
  },
});

const main = defineCommand({
  subCommands: {
    build,
    generate,
  },
});

runMain(main);
