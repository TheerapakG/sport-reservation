import { createFileRoute, Link } from "@tanstack/react-router";
import type { SVGProps } from "react";

const Google = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 256 262"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    {...props}
  >
    <path
      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      fill="#4285F4"
    />
    <path
      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      fill="#34A853"
    />
    <path
      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
      fill="#FBBC05"
    />
    <path
      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      fill="#EB4335"
    />
  </svg>
);

const Facebook = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    fill="url(#a)"
    height="1em"
    width="1em"
    {...props}
  >
    <defs>
      <linearGradient x1="50%" x2="50%" y1="97.078%" y2="0%" id="a">
        <stop offset="0%" stopColor="#0062E0" />
        <stop offset="100%" stopColor="#19AFFF" />
      </linearGradient>
    </defs>
    <path d="M15 35.8C6.5 34.3 0 26.9 0 18 0 8.1 8.1 0 18 0s18 8.1 18 18c0 8.9-6.5 16.3-15 17.8l-1-.8h-4l-1 .8z" />
    <path
      fill="#FFF"
      d="m25 23 .8-5H21v-3.5c0-1.4.5-2.5 2.7-2.5H26V7.4c-1.3-.2-2.7-.4-4-.4-4.1 0-7 2.5-7 7v4h-4.5v5H15v12.7c1 .2 2 .3 3 .3s2-.1 3-.3V23h4z"
    />
  </svg>
);

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
                  <span className="hidden text-center sm:inline">
                    Log in with LINE
                  </span>
                  <span className="inline text-center sm:hidden">LINE</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#000000] opacity-0 group-hover:opacity-10 group-focus:opacity-30"></div>
            </div>
          </Link>
          <Link to="/login/google">
            <div className="group relative h-12 rounded-md border border-[#000000]/[0.08] bg-[#ffffff]">
              <div className="flex h-full items-center divide-x divide-[#000000]/[0.08]">
                <Google className="h-12 w-12 flex-none p-2" />
                <div className="flex h-full flex-1 items-center justify-center text-[#000000]">
                  <span className="hidden text-center sm:inline">
                    Log in with Google
                  </span>
                  <span className="inline text-center sm:hidden">Google</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#000000] opacity-0 group-hover:opacity-10 group-focus:opacity-30"></div>
            </div>
          </Link>
          <Link to="/login/facebook">
            <div className="group relative h-12 rounded-md border border-[#000000]/[0.08] bg-[#ffffff]">
              <div className="flex h-full items-center divide-x divide-[#000000]/[0.08]">
                <Facebook className="h-12 w-12 flex-none p-2" />
                <div className="flex h-full flex-1 items-center justify-center text-[#000000]">
                  <span className="hidden text-center sm:inline">
                    Log in with Facebook
                  </span>
                  <span className="inline text-center sm:hidden">Facebook</span>
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

export const Route = createFileRoute("/_layout/login/")({
  component: LoginComponent,
});
