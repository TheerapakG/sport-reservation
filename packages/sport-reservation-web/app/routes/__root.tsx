import {
  createRootRoute,
  Link,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start";

import appCss from "@/styles/app.css?url";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

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
            <NavigationMenuItem>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                asChild
              >
                <Link
                  to="/test"
                  activeProps={{
                    className: "font-bold",
                  }}
                >
                  Test
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
  links: () => [{ rel: "stylesheet", href: appCss }],
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});
