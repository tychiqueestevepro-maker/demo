"use server";

import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function searchWorkspace(query: string) {
  try {
    const { userId } = await getServerUser();
    if (!query.trim()) return [];

    const normalizedQuery = query.trim();

    const [campaigns, targets, followUps] = await Promise.all([
      prisma.campaign.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: normalizedQuery, mode: "insensitive" } },
            { goal: { contains: normalizedQuery, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.campaignTarget.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: normalizedQuery, mode: "insensitive" } },
            { company: { contains: normalizedQuery, mode: "insensitive" } },
          ],
        },
        include: { campaign: true },
        take: 5,
      }),
      prisma.followUp.findMany({
        where: {
          userId,
          target: { name: { contains: normalizedQuery, mode: "insensitive" } }
        },
        include: { target: true },
        take: 5,
      }),
    ]);

    const results = [
      ...campaigns.map(c => ({
        id: `campaign-${c.id}`,
        title: c.name,
        detail: c.goal || "Campaign",
        type: "Campaign",
        href: `/app/campaigns/${c.id}`,
      })),
      ...targets.map(t => ({
        id: `target-${t.id}`,
        title: t.name,
        detail: `${t.company || ""} - Target`,
        type: "Target",
        href: `/app/campaigns/${t.campaignId}/targets/${t.id}`,
      })),
      ...followUps.map(f => ({
        id: `followup-${f.id}`,
        title: f.target.name,
        detail: f.messageSubject || "Follow-up",
        type: "Follow-up",
        href: "/app/follow-ups",
      })),
    ];

    return results.slice(0, 8);
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
