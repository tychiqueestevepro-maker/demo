import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/auth";
import { addDataSource, listDataSources } from "@/lib/services/data-source-service";
import { dataSourceCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    return ok(await listDataSources(userId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireUser(request);
    const input = dataSourceCreateSchema.parse(await request.json());
    return ok(await addDataSource(userId, input), 201);
  } catch (error) {
    return handleApiError(error);
  }
}

