import { currentUserProfileQueryOptions } from "@/api/oauth";
import { LoginSignupModal } from "@/components/modal/LoginSignupModal";
import { SubscriptionModal } from "@/components/modal/SubscriptionModal";
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
import { cn } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  CatchBoundary,
  createFileRoute,
  Link,
  Outlet,
} from "@tanstack/react-router";
import {
  CalendarIcon,
  ChevronDownIcon,
  MessageSquareIcon,
  SparklesIcon,
  TicketCheckIcon,
  UniversityIcon,
  UsersIcon,
} from "lucide-react";
import { subjects } from "sport-reservation-oauth-common/subjects";

const LoggedOutNavigationMenuList = () => {
  return (
    <div className="flex flex-1 items-center justify-end space-x-1">
      <LoginSignupModal initialView="login">
        <Button variant="ghost">Login</Button>
      </LoginSignupModal>
      <LoginSignupModal initialView="signup">
        <Button className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white hover:bg-[#AED6F1]">
          Sign Up
        </Button>
      </LoginSignupModal>
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
            {user.membership === "free" ? (
              <SubscriptionModal>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  asChild
                >
                  <Button
                    variant="ghost"
                    className="flex w-16 flex-col items-center justify-center gap-y-1"
                  >
                    <TicketCheckIcon className="size-6" />
                    <span className="text-xs">Spark Plus+</span>
                  </Button>
                </NavigationMenuLink>
              </SubscriptionModal>
            ) : undefined}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), "p-0")}
              asChild
            >
              <Link
                to="/event"
                activeProps={{
                  className: "font-bold",
                }}
              >
                <Button
                  variant="ghost"
                  className="flex w-16 flex-col items-center justify-center gap-y-1"
                >
                  <CalendarIcon className="size-6" />
                  <span className="text-xs">Events</span>
                </Button>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), "p-0")}
              asChild
            >
              <Link
                to="/club"
                activeProps={{
                  className: "font-bold",
                }}
              >
                <Button
                  variant="ghost"
                  className="flex w-16 flex-col items-center justify-center gap-y-1"
                >
                  <UniversityIcon className="size-6" />
                  <span className="text-xs">Clubs</span>
                </Button>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), "p-0")}
              asChild
            >
              <Link
                to="/matching"
                activeProps={{
                  className: "font-bold",
                }}
              >
                <Button
                  variant="ghost"
                  className="flex w-16 flex-col items-center justify-center gap-y-1"
                >
                  <SparklesIcon className="size-6" />
                  <span className="text-xs">Matching</span>
                </Button>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), "p-0")}
              asChild
            >
              <Link
                to="/friend"
                activeProps={{
                  className: "font-bold",
                }}
              >
                <Button
                  variant="ghost"
                  className="flex w-16 flex-col items-center justify-center gap-y-1"
                >
                  <UsersIcon className="size-6" />
                  <span className="text-xs">Friends</span>
                </Button>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), "p-0")}
              asChild
            >
              <Link
                to="/chat"
                activeProps={{
                  className: "font-bold",
                }}
              >
                <Button
                  variant="ghost"
                  className="flex w-16 flex-col items-center justify-center gap-y-1"
                >
                  <MessageSquareIcon className="size-6" />
                  <span className="text-xs">Messages</span>
                </Button>
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
            <Link to="/event/user">Your Events</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link to="/club/user">Your Clubs</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link to="/profile/user">View Profile</Link>
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
                    <Link to={user ? "/event" : "/"}>Spark</Link>
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
  const user = useSuspenseQuery(currentUserProfileQueryOptions());

  return (
    <WrappingLayoutComponent user={user.data?.profile}>
      <Outlet />
    </WrappingLayoutComponent>
  );
}

function NotFoundLayoutComponent() {
  const user = useSuspenseQuery(currentUserProfileQueryOptions());

  return (
    <WrappingLayoutComponent user={user.data?.profile}>
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
