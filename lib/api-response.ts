import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError } from "@/lib/auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Validation failed.", issues: error.issues }, { status: 400 });
  }

  console.error(error);
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  const stack = error instanceof Error ? error.stack : undefined;
  return NextResponse.json({ error: message, stack }, { status: 500 });
}

