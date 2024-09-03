import {
  build as buildNitro,
  copyPublicAssets,
  createNitro,
  prepare,
  prerender,
} from "nitropack";
import { build } from "unbuild";

const nitro = await createNitro({ rootDir: ".", dev: false });
await prepare(nitro);
await copyPublicAssets(nitro);
await prerender(nitro);
await buildNitro(nitro);
await nitro.close();
await build(".", false);
