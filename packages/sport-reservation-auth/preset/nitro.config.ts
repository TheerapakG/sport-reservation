import { createPreset } from "sport-reservation-common/server/preset";
import { fileURLToPath } from "url";

export default createPreset(fileURLToPath(new URL("../", import.meta.url)));
