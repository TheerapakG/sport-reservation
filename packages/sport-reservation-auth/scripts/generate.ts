import { createNitro, prepare, scanHandlers, writeTypes } from "nitropack";
import { build } from "unbuild";

const nitro = await createNitro({ rootDir: ".", dev: false });
await prepare(nitro);
await scanHandlers(nitro);
await writeTypes(nitro);
await nitro.close();
await build(".", false);
