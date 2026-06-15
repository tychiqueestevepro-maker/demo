"use client";

import * as React from "react";
import Link from "next/link";

import { LeafLogo } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

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

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: `${firstName} ${lastName}`.trim() || undefined,
              first_name: firstName,
              last_name: lastName,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data?.session) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; secure`;
          document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; secure`;
        }

        setSuccess(true);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        if (data?.session) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; secure`;
          document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; secure`;
        }

        window.location.href = "/app/dashboard";
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
          <Badge tone="violet">14-day free trial</Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
            {mode === "login" ? "Welcome back to your campaign cockpit." : "Start your free trial. No card required."}
          </h1>
          <p className="mt-5 text-lg leading-8 text-neutral-600">
            Generate playbooks, manage target context, and keep follow-ups visible without automatic sending.
          </p>
        </div>
        <p className="text-sm text-neutral-500">verytis - Follow-up cockpit</p>
      </div>
      <div className="flex items-center justify-center border-l border-neutral-200 bg-white p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{mode === "login" ? "Log in" : "Create account"}</CardTitle>
            <CardDescription>{mode === "login" ? "Continue to your workspace." : "Start your 14-day free trial."}</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="font-semibold text-emerald-800">Check your email</p>
                <p className="mt-2 text-sm text-emerald-700/70">
                  We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}
                {mode === "signup" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="First name">
                      <Input
                        placeholder="First name"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Last name">
                      <Input
                        placeholder="Last name"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                      />
                    </Field>
                  </div>
                ) : null}
                <Field label="Email">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </Field>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-semibold text-neutral-700">Password</label>
                    {mode === "login" ? (
                      <Link href="/forgot-password" className="text-sm font-semibold text-violet-600 hover:text-violet-700 hover:underline">
                        Forgot password?
                      </Link>
                    ) : null}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" variant="accent" disabled={loading}>
                  {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
                </Button>
                <p className="text-center text-sm text-neutral-500">
                  {mode === "login" ? "No account yet? " : "Already have an account? "}
                  <Link className="font-semibold text-neutral-950" href={mode === "login" ? "/signup" : "/login"}>
                    {mode === "login" ? "Sign up" : "Log in"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
