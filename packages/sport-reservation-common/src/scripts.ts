import { defineCommand, runMain } from "citty";

export const main = defineCommand({
  subCommands: {
    client: () => import("./client/scripts").then(({ main }) => main),
  },
});

runMain(main);
