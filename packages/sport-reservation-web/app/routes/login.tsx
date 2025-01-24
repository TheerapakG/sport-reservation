import { createFileRoute, Link } from "@tanstack/react-router";

function LoginComponent() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="hidden aspect-square h-full p-2 2xl:block">
        <h1>We are Spark!</h1>
        <p>
          Sport-focused matching website where you can find right person at
          anytime... We believe in data, not destiny!
        </p>
      </div>
      <div className="flex max-w-(--breakpoint-sm) flex-1 flex-col items-center p-2 2xl:max-w-none">
        <h1>Welcome back!</h1>
        <div className="flex w-full items-center gap-x-1 p-2">
          <hr className="flex-1" />
          <span className="flex-none">OR LOGIN WITH</span>
          <hr className="flex-1" />
        </div>
        <div className="grid w-full grid-cols-2 gap-2">
          <Link to="/login/line">
            <div className="group relative h-12 rounded-md bg-[#06c755]">
              <div className="flex h-full items-center divide-x divide-[#000000]/[0.08]">
                <img
                  className="h-12 w-12 flex-none p-2"
                  src="https://cdn.theerapakg.moe/reservation/asset/login/line.png"
                ></img>
                <div className="flex h-full flex-1 items-center justify-center text-[#ffffff]">
                  <span>Log in with LINE</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#000000] opacity-0 group-hover:opacity-10 group-focus:opacity-30"></div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});
