import { NextRequest } from "next/server";

export async function readJson(request: NextRequest) {
  const text = await request.text();
  return text ? JSON.parse(text) : {};
}

