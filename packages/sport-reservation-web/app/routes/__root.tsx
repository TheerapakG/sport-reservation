import React from "react";
import {
  createRootRoute,
  Link,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start";

import appCss from "@/styles/app.css?url";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const TanStackRouterDevtools =
  import.meta.env.MODE === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

const RootDocument = ({ children }: { children: React.ReactNode }) => {
  return (
    <Html>
      <Head>
        <Meta />
      </Head>
      <Body>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                asChild
              >
                <Link
                  to="/"
                  activeProps={{
                    className: "font-bold",
                  }}
                >
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <hr />
        {children}
        <ScrollRestoration />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </Body>
    </Html>
  );
};

const RootComponent = () => {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
};

const NotFoundComponent = () => {
  return (
    <RootDocument>
      <h3>Not Found!</h3>
    </RootDocument>
  );
};

export const Route = createRootRoute({
  meta: () => [
    {
      title:
        "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
    },
    {
      charSet: "UTF-8",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0",
    },
  ],
  links: () => [
    { rel: "stylesheet", href: appCss },
    { rel: "manifest", href: "/manifest.json" },
  ],
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});
