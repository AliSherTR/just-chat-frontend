"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { signupSchema, type SignupFormValues } from "@/schema";
import { useAuth } from "@/features/auth/api/useAuth";

export default function SignupPage() {
  const { signup, signupStatus } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignupFormValues) {
    signup(data);
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Create an account</h2>
        <p className="mt-2 text-muted-foreground">
          Enter your information to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className={errors.firstName ? "text-destructive" : ""}
            >
              First name
            </Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              disabled={signupStatus}
              {...register("firstName")}
              className={
                errors.firstName
                  ? "border-destructive focus-visible:ring-destructive"
                  : "border-muted-foreground"
              }
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className={errors.lastName ? "text-destructive" : ""}
            >
              Last name
            </Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              disabled={signupStatus}
              {...register("lastName")}
              className={
                errors.lastName
                  ? "border-destructive focus-visible:ring-destructive"
                  : "border-muted-foreground"
              }
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

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
            disabled={signupStatus}
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
          <Label
            htmlFor="password"
            className={errors.password ? "text-destructive" : ""}
          >
            Password
          </Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            disabled={signupStatus}
            error={!!errors.password}
            {...register("password")}
            className={
              errors.password ? "border-destructive" : "border-muted-foreground"
            }
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className={errors.confirmPassword ? "text-destructive" : ""}
          >
            Confirm password
          </Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            disabled={signupStatus}
            className={
              errors.password ? "border-destructive" : "border-muted-foreground"
            }
            error={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-black cursor-pointer"
          disabled={signupStatus}
        >
          {signupStatus ? "Creating account..." : "Create account"}
        </Button>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-muted-foreground hover:underline"
          >
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}
