import { FollowUpCampaignQueue, PageHeader } from "@/components/product-components";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function FollowUpsPage() {
  let userId;
  try {
    const user = await getServerUser();
    userId = user.userId;
  } catch {
    redirect("/login");
  }

  const dbFollowUps = await prisma.followUp.findMany({
    where: { userId },
    include: {
      campaign: true,
      target: true,
    },
    orderBy: { dueAt: "asc" },
  });

  const campaigns = await prisma.campaign.findMany({
    where: { userId },
  });

  const targets = await prisma.campaignTarget.findMany({
    where: { userId },
  });

  const followUps = dbFollowUps.map(fu => ({
    id: fu.id,
    campaignId: fu.campaignId,
    targetId: fu.targetId,
    target: fu.target.name,
    campaign: fu.campaign.name,
    type: "Email", // or map from stage if available
    reason: fu.messageSubject || "Follow-up",
    priority: fu.priority === "HIGH" || fu.priority === "URGENT" ? "High" : "Normal",
    status: fu.status,
    due: new Date(fu.dueAt).toLocaleDateString(),
    missingContext: false, // Calculate if needed
    messagePreview: fu.messageBody,
  }));

  const campaignsData = campaigns.map(c => ({
    id: c.id,
    name: c.name,
    status: c.status,
    type: c.type,
    goal: c.goal,
    channel: c.channel || "",
    followUpsDue: dbFollowUps.filter(f => f.campaignId === c.id && f.status === "DUE").length,
  }));

  const targetsData = targets.map(t => ({
    id: t.id,
    campaignId: t.campaignId,
    name: t.name,
    company: t.company || "",
    role: t.role || "",
    email: t.email || "",
    status: t.status,
    priority: t.priority,
    nextAction: t.nextActionAt ? new Date(t.nextActionAt).toLocaleDateString() : "",
  }));

  return (
    <>
      <PageHeader
        eyebrow="Follow-ups"
        title="Campaign queue"
        description="Choose a campaign, then work its manual queue in order: replies first, urgent due actions next, blocked context before copy/send."
      />
      <FollowUpCampaignQueue 
        initialFollowUps={followUps as any}
        initialCampaigns={campaignsData} 
        initialTargets={targetsData} 
      />
    </>
  );
}
