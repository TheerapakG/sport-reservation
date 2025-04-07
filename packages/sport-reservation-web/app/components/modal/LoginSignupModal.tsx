import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppForm } from "@/utils/form";
import { Link } from "@tanstack/react-router";
import { type } from "arktype";
import { Match } from "effect";
import type { SVGProps } from "react";
import * as React from "react";

// Reuse SVGs from login/index.tsx
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

// Arktype Schemas
const SignupSchema = type({
  username: "string>0",
  email: "string.email",
  password: "string>=8",
  confirmPassword: "string>=8",
  birthdate: "string",
}).pipe((data) => {
  if (data.password !== data.confirmPassword) {
    return [{ path: ["confirmPassword"], message: "Passwords do not match" }];
  }
  return data;
});

const LoginSchema = type({
  email: "string.email",
  password: "string>0",
});

// Types
type ModalView = "signup" | "login" | "signupEmail";
type SetViewFn = React.Dispatch<React.SetStateAction<ModalView>>;

// Props for sub-components
interface ViewProps {
  setView: SetViewFn;
}

// --- Initial View Component ---
const SignupView = ({ setView }: Omit<ViewProps, "onClose">) => {
  return (
    <>
      <DialogHeader className="mb-4">
        <DialogTitle className="text-center text-2xl font-bold">
          Sign up
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-y-4 py-4">
        {/* Platform Logins */}
        <Button
          className="flex items-center justify-center gap-2 bg-[#06c755] py-5 text-base text-[#ffffff] hover:opacity-90"
          asChild
        >
          <Link to="/login/line">
            <img
              className="h-5 w-5"
              src="https://cdn.theerapakg.moe/reservation/asset/login/line.png"
              alt="LINE logo"
            />
            Continue with Line
          </Link>
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 border border-gray-300 py-5 text-base"
          asChild
        >
          <Link to="/login/google">
            <Google className="h-5 w-5" />
            Continue with Google
          </Link>
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 border border-gray-300 py-5 text-base"
          asChild
        >
          <Link to="/login/facebook">
            <Facebook className="h-5 w-5" />
            Continue with Facebook
          </Link>
        </Button>

        {/* Separator */}
        <div className="my-6 flex items-center">
          <hr className="flex-grow border-t" />
          <span className="mx-4 text-xs text-gray-500 uppercase">OR</span>
          <hr className="flex-grow border-t" />
        </div>

        {/* Email Signup */}
        <Button
          variant="link"
          className="text-center text-sm font-medium text-sky-600"
          onClick={() => setView("signupEmail")}
        >
          Sign up with email
        </Button>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 text-sm font-medium text-sky-600"
            onClick={() => setView("login")}
          >
            Log in
          </Button>
        </div>
      </div>
    </>
  );
};

// --- Login Email View Component ---
const LoginView = ({ setView }: ViewProps) => {
  const loginForm = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Login Submitted:", value);
    },
  });

  return (
    <>
      <DialogHeader className="mb-4">
        <DialogTitle className="text-center text-2xl font-bold">
          Log in
        </DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          loginForm.handleSubmit();
        }}
        className="flex flex-col gap-y-4 py-4"
      >
        <p className="text-center text-sm text-gray-500">
          Not a member yet?{" "}
          <Button
            variant="link"
            className="p-0 text-sm font-medium text-sky-600"
            onClick={() => setView("signup")}
          >
            Sign up
          </Button>
        </p>
        <loginForm.AppField
          name="email"
          children={(field) => (
            <field.TextInputField label="Email" placeholder="Email" />
          )}
        />
        <loginForm.AppField
          name="password"
          children={(field) => (
            <field.TextInputField
              label="Password"
              placeholder="Password"
              type="password"
            />
          )}
        />
        <loginForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="mt-4 w-full rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] py-2.5 text-base text-white hover:opacity-90"
            >
              {isSubmitting ? "Logging In..." : "Log In"}
            </Button>
          )}
        />
        {/* Separator */}
        <div className="my-6 flex items-center">
          <hr className="flex-grow border-t" />
          <span className="mx-4 text-xs text-gray-500 uppercase">OR</span>
          <hr className="flex-grow border-t" />
        </div>
        {/* Platform Logins */}
        <Button
          className="flex items-center justify-center gap-2 bg-[#06c755] py-5 text-base text-[#ffffff] hover:opacity-90"
          asChild
        >
          <Link to="/login/line">
            <img
              className="h-5 w-5"
              src="https://cdn.theerapakg.moe/reservation/asset/login/line.png"
              alt="LINE logo"
            />
            Continue with Line
          </Link>
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 border border-gray-300 py-5 text-base"
          asChild
        >
          <Link to="/login/google">
            <Google className="h-5 w-5" />
            Continue with Google
          </Link>
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 border border-gray-300 py-5 text-base"
          asChild
        >
          <Link to="/login/facebook">
            <Facebook className="h-5 w-5" />
            Continue with Facebook
          </Link>
        </Button>
      </form>
    </>
  );
};

const SignupEmailView = ({ setView }: ViewProps) => {
  const signupForm = useAppForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthdate: "",
    },
    validators: {
      onSubmit: SignupSchema,
    },
    onSubmit: async ({ value }) => {
      if (Array.isArray(value)) {
        console.error("Validation errors from pipe:", value);
        return;
      }

      let birthDateObj: Date | null = null;
      try {
        birthDateObj = new Date(value.birthdate);
        if (isNaN(birthDateObj.getTime())) {
          throw new Error("Invalid date");
        }
      } catch (_e) {
        console.error("Invalid date format submitted:", value.birthdate);
        return;
      }

      const submitValue = {
        ...value,
        birthdate: birthDateObj,
      };
      console.log("Signup Submitted:", submitValue);
    },
  });

  return (
    <>
      <DialogHeader className="mb-4">
        <DialogTitle className="text-center text-2xl font-bold">
          Sign up with Email
        </DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          signupForm.handleSubmit();
        }}
        className="flex flex-col gap-y-4 py-4"
      >
        <signupForm.AppField
          name="username"
          children={(field) => (
            <field.TextInputField label="Username" placeholder="Username" />
          )}
        />
        <signupForm.AppField
          name="email"
          children={(field) => (
            <field.TextInputField label="Email" placeholder="Email" />
          )}
        />
        <signupForm.AppField
          name="password"
          children={(field) => (
            <field.TextInputField
              label="Password"
              placeholder="Password"
              type="password"
            />
          )}
        />
        <signupForm.AppField
          name="confirmPassword"
          children={(field) => (
            <field.TextInputField
              label="Confirm Password"
              placeholder="Confirm Password"
              type="password"
            />
          )}
        />
        <signupForm.AppField
          name="birthdate"
          children={(field) => <field.TextInputField label="Birthdate" />}
        />
        <signupForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="mt-4 w-full rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] py-2.5 text-base text-white hover:opacity-90"
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </Button>
          )}
        />
        <Button variant="link" onClick={() => setView("signup")}>
          Back
        </Button>
      </form>
    </>
  );
};

export function LoginSignupModal({
  initialView,
  children,
}: {
  initialView: ModalView;
  children: React.ReactNode;
}) {
  const [view, setView] = React.useState<ModalView>(initialView);

  // Conditionally render the correct view component, passing necessary props
  const renderView = () => {
    return Match.value(view).pipe(
      Match.when("signup", () => <SignupView setView={setView} />),
      Match.when("login", () => <LoginView setView={setView} />),
      Match.when("signupEmail", () => <SignupEmailView setView={setView} />),
      Match.exhaustive,
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">{renderView()}</DialogContent>
    </Dialog>
  );
}
