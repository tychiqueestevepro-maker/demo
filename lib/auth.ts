import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthContext = {
  userId: string;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function requireUser(request: NextRequest): Promise<AuthContext> {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new ApiError(500, "Supabase environment variables are required for authentication.");
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(bearerToken);

    if (error || !user?.id || !user.email) {
      throw new ApiError(401, "Invalid Supabase session.");
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: getSupabaseDisplayName(user.user_metadata),
        avatarUrl: getSupabaseAvatarUrl(user.user_metadata),
      },
      create: {
        id: user.id,
        email: user.email,
        name: getSupabaseDisplayName(user.user_metadata),
        avatarUrl: getSupabaseAvatarUrl(user.user_metadata),
        subscription: {
          create: {
            status: "trialing",
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    return { userId: user.id };
  }

  const envUserId = process.env.DEV_USER_ID;

  if (envUserId) {
    return { userId: envUserId };
  }

  if (process.env.NODE_ENV !== "production") {
    const user = await prisma.user.findFirst({ select: { id: true } });
    if (user) {
      return { userId: user.id };
    }
  }

  throw new ApiError(401, "Authentication required.");
}

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authHeader.slice("bearer ".length).trim();
}

function getSupabaseDisplayName(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const values = metadata as Record<string, unknown>;
  const name = values.name ?? values.full_name ?? values.display_name ?? `${values.first_name || ''} ${values.last_name || ''}`.trim();
  return typeof name === "string" ? name : null;
}

function getSupabaseAvatarUrl(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const values = metadata as Record<string, unknown>;
  const avatarUrl = values.avatar_url ?? values.picture;
  return typeof avatarUrl === "string" ? avatarUrl : null;
}

export function assertOwned<T>(record: (T & { userId: string }) | null, userId: string): T & { userId: string } {
  if (!record || record.userId !== userId) {
    throw new ApiError(404, "Record not found.");
  }

  return record;
}

export async function getServerUser(): Promise<AuthContext & { email?: string; name?: string; avatarUrl?: string }> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new ApiError(401, "Authentication required.");
  }

  const accessToken = cookieStore.get("sb-access-token")?.value
    ?? cookieStore.get(`sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`)?.value;

  if (accessToken) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);

    if (user?.id) {
      // Upsert the user to ensure they exist in the DB (for new signups)
      const name = getSupabaseDisplayName(user.user_metadata);
      const avatarUrl = getSupabaseAvatarUrl(user.user_metadata);
      
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email,
            name: name,
            avatarUrl: avatarUrl,
          },
          create: {
            id: user.id,
            email: user.email || "",
            name: name,
            avatarUrl: avatarUrl,
            subscription: {
              create: {
                status: "trialing",
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              },
            },
          },
        });
      } catch (error) {
        console.error("Failed to sync user to database:", error);
      }

      return { 
        userId: user.id,
        email: user.email,
        name: name || undefined,
        avatarUrl: avatarUrl || undefined
      };
    }
  }

  throw new ApiError(401, "Authentication required.");
}
