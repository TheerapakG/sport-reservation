import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { routeTree } from "./routeTree.gen";

export const createRouter = () => {
  const queryClient = new QueryClient();

  return routerWithQueryClient(
    createTanstackRouter({
      routeTree,
      defaultPreload: "intent",
      scrollRestoration: true,
      context: {
        queryClient,
      },
    }),
    queryClient,
  );
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
