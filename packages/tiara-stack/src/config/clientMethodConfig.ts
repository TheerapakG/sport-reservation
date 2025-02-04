export type ClientMethodConfig<Name extends string> = {
  name: Name;
};

export const defineClientMethodConfig = <Name extends string>(
  config: ClientMethodConfig<Name>,
): ClientMethodConfig<Name> => config;
