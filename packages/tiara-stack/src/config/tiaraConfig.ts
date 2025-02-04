import { RuntimeConfigShape } from "./effectConfig";

export type TiaraConfig<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ConfigRuntimeConfigShape extends RuntimeConfigShape = any,
> = {
  name: string;
  runtimeConfig: ConfigRuntimeConfigShape;
};

/*@__NO_SIDE_EFFECTS__*/
export const defineTiaraConfig = <Config extends TiaraConfig>(
  config: Config,
): Config => config;
