import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { useAxios } from "@/hooks/useAxios";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  username_or_email: z
    .string()
    .trim()
    .min(1, "Username or email is required"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must contain at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/[0-9]/, "Include at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Include at least one special character"
    ),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginResponse = {
  status: boolean;
  message?: string;
};

export default function LoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { loading, request } = useAxios<LoginResponse>();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username_or_email: "",
      password: "",
    },
  });

  // Check whether the user is already authenticated.
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await request({
          method: "GET",
          url: "/api/auth/check-auth",
        });

        if (!isMounted) return;

        if (response?.status === true) {
          navigate("/", { replace: true });
          return;
        }
      } catch (error: unknown) {
        if (!isMounted) return;

        const status = (
          error as {
            response?: {
              status?: number;
            };
          }
        )?.response?.status;

        if (status !== 401) {
          console.error(
            "Authentication check failed:",
            error
          );
        }
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    void checkAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate, request]);

  // Submit login credentials.
  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await request({
        method: "POST",
        url: "/api/auth/login",
        data: values,
      });

      if (!response) {
        toast.error("Unable to log in. Please try again.");
        return;
      }

      if (response.status === true) {
        toast.success(
          response.message || "Login successful!"
        );

        navigate("/", { replace: true });
      } else {
        toast.error(response.message || "Login failed.");
      }
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
        };
      };

      const responseData = apiError?.response?.data;

      toast.error(
        responseData?.detail ||
          responseData?.message ||
          "Login failed. Please try again."
      );
    }
  }

  const isSubmitting =
    loading || form.formState.isSubmitting;

  // Avoid showing the login form while checking the session.
  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoaderCircle className="size-6 animate-spin text-gray-600" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Logo and Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-4 flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-black">
              <img
                src="/montra-logo.svg"
                alt="Montra logo"
                className="size-full object-contain p-2"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />

              <Wallet className="pointer-events-none absolute size-7 text-white" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
              Welcome to Montra
            </h1>

            <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
              Sign in to manage your income and expenses in
              one place.
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <FieldGroup className="gap-5">
              {/* Username or Email */}
              <Field>
                <FieldLabel htmlFor="username_or_email">
                  Username or email
                </FieldLabel>

                <Input
                  id="username_or_email"
                  type="text"
                  placeholder="Enter your username or email"
                  autoComplete="username"
                  aria-invalid={Boolean(
                    form.formState.errors.username_or_email
                  )}
                  className="h-11 rounded-lg border-gray-200 bg-white shadow-none focus-visible:ring-1"
                  {...form.register("username_or_email")}
                />

                {form.formState.errors.username_or_email && (
                  <FieldError>
                    {
                      form.formState.errors
                        .username_or_email.message
                    }
                  </FieldError>
                )}
              </Field>

              {/* Password */}
              <Field>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel htmlFor="password">
                    Password
                  </FieldLabel>

                  <a
                    href="/forgot-password"
                    className="text-xs font-medium text-gray-600 underline-offset-4 hover:text-black hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(
                      form.formState.errors.password
                    )}
                    className="h-11 rounded-lg border-gray-200 bg-white pr-11 shadow-none focus-visible:ring-1"
                    {...form.register("password")}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((visible) => !visible)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-black"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>

                {form.formState.errors.password && (
                  <FieldError>
                    {form.formState.errors.password.message}
                  </FieldError>
                )}

                <FieldDescription>
                  Use at least 8 characters with uppercase,
                  lowercase, a number, and a special character.
                </FieldDescription>
              </Field>
            </FieldGroup>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg bg-black font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            {/* Sign Up Link */}
            <FieldDescription className="pt-1 text-center">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-black underline underline-offset-4"
              >
                Create an account
              </a>
            </FieldDescription>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Montra · Your finances, organized.
        </p>
      </div>
    </main>
  );
}

