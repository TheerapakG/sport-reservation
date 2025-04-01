import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { NavUserAvatar } from "@/components/UserAvatar";
import {
  CatchBoundary,
  createFileRoute,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { subjects } from "sport-reservation-oauth-common/subjects";

const WrappingLayoutComponent = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: typeof subjects.user.infer;
}) => {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-grid bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center justify-start space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="group bg-background inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-xl font-bold"
                    asChild
                  >
                    <Link
                      to="/"
                      activeProps={{
                        className: "font-bold",
                      }}
                    >
                      Spark
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-1">
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
                      to="/"
                      activeProps={{
                        className: "font-bold",
                      }}
                    >
                      Features
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
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
                      Inbox
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <NavUserAvatar profile={user} />
          </div>
        </div>
      </header>
      <main className="h-full overflow-x-hidden overflow-y-auto">
        <div className="container h-full flex-1 items-start">
          <CatchBoundary
            getResetKey={() => "reset"}
            onCatch={(error) => console.error(error)}
          >
            {children}
          </CatchBoundary>
        </div>
      </main>
    </div>
  );
};

function LayoutComponent() {
  const { user } = Route.useLoaderData();

  return (
    <WrappingLayoutComponent user={user.profile}>
      <Outlet />
    </WrappingLayoutComponent>
  );
}

function NotFoundLayoutComponent() {
  const { user } = Route.useLoaderData();

  return (
    <WrappingLayoutComponent user={user.profile}>
      <div className="p-2">
        <h3>Not Found!</h3>
      </div>
    </WrappingLayoutComponent>
  );
}

export const Route = createFileRoute("/_layout")({
  loader: async ({ context: { user } }) => {
    return { user };
  },
  component: LayoutComponent,
  notFoundComponent: NotFoundLayoutComponent,
});
