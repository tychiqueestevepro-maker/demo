"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LeafLogo } from "@/components/product-components";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#f7f5f0] lg:grid-cols-[1fr_0.9fr]">
      <div className="flex flex-col justify-between p-8 md:p-12">
        <Link href="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight text-[#332252]/90 transition-colors hover:text-[#332252]">
          <span className="grid h-8 w-8 place-items-center text-violet-600">
            <LeafLogo className="h-8 w-8" />
          </span>
          verytis
        </Link>
        <div className="my-16 max-w-xl">
          <Badge tone="violet">Account recovery</Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
            Reset your password.
          </h1>
          <p className="mt-5 text-lg leading-8 text-neutral-600">
            Enter your email address and we'll send you a link to get back into your account.
          </p>
        </div>
        <p className="text-sm text-neutral-500">verytis — Follow-up cockpit</p>
      </div>
      <div className="flex items-center justify-center border-l border-neutral-200 bg-white p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Forgot password</CardTitle>
            <CardDescription>Enter your email to receive a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="font-semibold text-emerald-800">Check your email</p>
                <p className="mt-2 text-sm text-emerald-700/70">
                  We sent a password reset link to <strong>{email}</strong>. Check your inbox and spam folder.
                </p>
                <Button className="mt-4 w-full" variant="secondary" onClick={() => window.location.href = "/login"}>
                  Return to log in
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-neutral-700">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" variant="accent" disabled={loading}>
                  {loading ? "Sending link..." : "Send reset link"}
                </Button>
                <p className="text-center text-sm text-neutral-500">
                  Remember your password?{" "}
                  <Link className="font-semibold text-neutral-950" href="/login">
                    Log in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
