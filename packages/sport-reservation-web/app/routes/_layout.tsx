import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { UserAvatar } from "@/components/UserAvatar";
import {
  CatchBoundary,
  createFileRoute,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
import { subjects } from "sport-reservation-oauth-common/subjects";

const LoggedOutNavigationMenuList = () => {
  const router = useRouter();

  return (
    <div className="flex flex-1 items-center justify-end space-x-1">
      <Button variant="ghost" onClick={() => router.navigate({ to: "/login" })}>
        Login
      </Button>
      <Button
        className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white hover:bg-[#AED6F1]"
        onClick={() => router.navigate({ to: "/login" })}
      >
        Sign Up
      </Button>
    </div>
  );
};

const LoggedInNavigationMenuList = ({
  user,
}: {
  user: typeof subjects.user.infer;
}) => {
  return (
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
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex flex-0 items-center justify-center">
            <UserAvatar profile={user} />
            <ChevronDownIcon className="size-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Link to="/event">Your Events</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link to="/club">Your Clubs</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link to="/profile">View Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link to="/logout">Log Out</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const WrappingLayoutComponent = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: typeof subjects.user.infer;
}) => {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-grid bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b-2 border-[#65D1F8] backdrop-blur-sm">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center justify-start space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] bg-clip-text px-4 py-2 text-2xl font-bold text-transparent"
                    asChild
                  >
                    <Link to="/">Spark</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          {user ? (
            <LoggedInNavigationMenuList user={user} />
          ) : (
            <LoggedOutNavigationMenuList />
          )}
        </div>
      </header>
      <main className="h-full overflow-x-hidden overflow-y-auto">
        <div className="relative container h-full flex-1 items-start">
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
