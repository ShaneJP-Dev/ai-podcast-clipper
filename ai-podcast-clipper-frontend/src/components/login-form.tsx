"use client";

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import Link from "next/link";
import { LoginSchema,  type LoginFormValues } from "~/schemas/auth";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const {
    register, 
    handleSubmit, 
    formState: {errors}
  } = useForm<LoginFormValues>({resolver: zodResolver(LoginSchema)});

  const onSubmit = async (data: LoginFormValues) => {
    try{
      setIsSubmitting(true);
      setError(null);
      
      const signInResult = await signIn("credentials", {
        email: data.email, 
        password: data.password, 
        redirect: false 
      });

      if (signInResult?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        // Redirect to the dashboard or home page after successful sign up
        router.push("/dashboard");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }catch (error) {
      setError("An error occurred while signing up. Please try again.");
    }finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your email below to log in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>

                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  {...register("password")} 
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-red-500 text-sm rounded-md bg-red-50 p-2">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Login In..." : "Login"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
