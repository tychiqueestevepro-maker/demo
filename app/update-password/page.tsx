"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LeafLogo } from "@/components/product-components";

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
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
          <Badge tone="violet">Security</Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
            Choose a new password.
          </h1>
          <p className="mt-5 text-lg leading-8 text-neutral-600">
            Make sure it's at least 8 characters long.
          </p>
        </div>
        <p className="text-sm text-neutral-500">verytis — Follow-up cockpit</p>
      </div>
      <div className="flex items-center justify-center border-l border-neutral-200 bg-white p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Update password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="font-semibold text-emerald-800">Password updated!</p>
                <p className="mt-2 text-sm text-emerald-700/70">
                  Your password has been changed successfully. You can now access your account.
                </p>
                <Button className="mt-4 w-full" variant="accent" onClick={() => window.location.href = "/app/dashboard"}>
                  Go to Dashboard
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
                  <label htmlFor="new-password" className="text-sm font-semibold text-neutral-700">New Password</label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-semibold text-neutral-700">Confirm Password</label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" className="w-full" variant="accent" disabled={loading}>
                  {loading ? "Updating..." : "Update password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
