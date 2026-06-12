import Link from "next/link";
import { Plus } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { CampaignDirectory, PageHeader } from "@/components/product-components";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function CampaignsPage() {
  const { userId } = await getServerUser();

  const campaignsData = await prisma.campaign.findMany({
    where: { userId },
    include: {
      targets: true,
      followUps: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedCampaigns = campaignsData.map((campaign) => {
    const totalTargets = campaign.targets.length;
    const completed = campaign.targets.filter((t) => t.status === "COMPLETED" || t.status === "INTERESTED").length;
    const replies = campaign.targets.filter((t) => t.status === "REPLIED").length;
    const blocked = campaign.targets.filter((t) => t.status === "STOPPED" || t.status === "NOT_INTERESTED").length;
    const followUpsDue = campaign.followUps.filter((f) => f.status === "DUE").length;
    const progress = totalTargets > 0 ? Math.round((completed / totalTargets) * 100) : 0;

    return {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type.replace("_", " "),
      goal: campaign.goal,
      status: campaign.status === "DRAFT" ? "Review" : 
              campaign.status === "ACTIVE" ? "Active" : 
              campaign.status === "COMPLETED" ? "Completed" : "Waiting",
      owner: campaign.user.name || campaign.user.email || "Unknown",
      channel: campaign.channel || "Email",
      deadline: campaign.deadline ? format(new Date(campaign.deadline), "MMM d, yyyy") : "No deadline",
      targets: totalTargets,
      completed,
      replies,
      blocked,
      followUpsDue,
      progress,
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Campaigns"
        title="Manual follow-up workspaces"
        description="Track each campaign with the few signals that matter: due actions, replies, blockers, progress, owner, and manual channels."
        action={<Button asChild variant="accent"><Link href="/app/campaigns/new"><Plus className="h-4 w-4" />Create workspace</Link></Button>}
      />
      <CampaignDirectory rows={formattedCampaigns as any} />
    </>
  );
}
