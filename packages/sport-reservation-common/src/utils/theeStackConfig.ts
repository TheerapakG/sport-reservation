import { RuntimeConfigShape } from "./effectConfig";

export type TheeStackConfig<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ConfigRuntimeConfigShape extends RuntimeConfigShape = any,
> = {
  name: string;
  runtimeConfig: ConfigRuntimeConfigShape;
};

/*@__NO_SIDE_EFFECTS__*/
export const defineTheeStackConfig = <Config extends TheeStackConfig>(
  config: Config,
): Config => config;
