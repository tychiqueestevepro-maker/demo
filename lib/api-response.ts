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
  return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
}

