import type { NitroPreset } from "nitropack";
import { withClientHooks } from "sport-reservation-common/client/hooks";

export default withClientHooks({
  extends: "node-server",
}) as NitroPreset;
