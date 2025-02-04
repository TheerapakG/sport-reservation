import { createPreset } from "tiara-stack/server/preset";
import { fileURLToPath } from "url";

export default createPreset(fileURLToPath(new URL("../", import.meta.url)));
