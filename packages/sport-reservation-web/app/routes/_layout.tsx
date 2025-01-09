import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  CatchBoundary,
  createFileRoute,
  Link,
  Outlet,
} from "@tanstack/react-router";

const WrappingLayoutComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center justify-start space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-xl font-bold"
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
            <Avatar>
              <AvatarFallback>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <div className="container flex-1 items-start">
          <CatchBoundary
            getResetKey={() => "reset"}
            onCatch={(error) => console.error(error)}
          >
            {children}
          </CatchBoundary>
        </div>
      </main>
    </>
  );
};

function LayoutComponent() {
  return (
    <WrappingLayoutComponent>
      <Outlet />
    </WrappingLayoutComponent>
  );
}

function NotFoundLayoutComponent() {
  return (
    <WrappingLayoutComponent>
      <div className="p-2">
        <h3>Not Found!</h3>
      </div>
    </WrappingLayoutComponent>
  );
}

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
  notFoundComponent: NotFoundLayoutComponent,
});
