"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { loginSchema, type LoginFormValues } from "@/schema/index";
import { useAuth } from "@/features/auth/api/useAuth";

export default function LoginPage() {
  const { login, loggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    login(data);
  }

  return (
    <div className="w-full ">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Log in</h2>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Please enter your details.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className={errors.email ? "text-destructive" : ""}
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={
              errors.email
                ? "border-destructive focus-visible:ring-destructive"
                : "border-muted-foreground"
            }
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className={errors.password ? "text-destructive" : ""}
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            error={!!errors.password}
            className="border-muted-foreground"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-black cursor-pointer"
          disabled={loggingIn}
        >
          {loggingIn ? "Logging in..." : "Log in"}
        </Button>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-muted-foreground hover:underline"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
