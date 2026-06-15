import { DataDirectoryWorkspace, PageHeader } from "@/components/product-components";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { CampaignStatus, Priority, TargetStatus } from "@/lib/mock-data";
import { redirect } from "next/navigation";

export default async function DataDirectoryPage() {
  let userId;
  try {
    const user = await getServerUser();
    userId = user.userId;
  } catch {
    redirect("/login");
  }

  const campaigns = await prisma.campaign.findMany({ where: { userId } });
  const targets = await prisma.campaignTarget.findMany({ where: { userId } });
  const dataSources = await prisma.dataSource.findMany({ where: { userId } });

  const campaignsData = campaigns.map(c => ({
    id: c.id,
    name: c.name,
    status: mapCampaignStatus(c.status),
    type: c.type,
    goal: c.goal,
    targets: targets.filter(t => t.campaignId === c.id).length,
  }));

  const targetsData = targets.map(t => ({
    id: t.id,
    campaignId: t.campaignId,
    name: t.name,
    role: t.role || "",
    company: t.company || "",
    status: mapTargetStatus(t.status),
    priority: mapPriority(t.priority),
  }));

  const dataSourcesData = dataSources.map(d => ({
    id: d.id,
    title: d.title,
    type: d.type,
    url: d.url || "",
    description: d.description || "",
    fileSizeBytes: d.fileSizeBytes,
    campaignId: d.campaignId || "",
    targetId: d.targetId || undefined,
    linkedCampaign: campaigns.find(c => c.id === d.campaignId)?.name,
    linkedTarget: targets.find(t => t.id === d.targetId)?.name,
    missing: false,
    importance: d.importance,
    lastChecked: d.lastCheckedAt ? new Date(d.lastCheckedAt).toLocaleDateString() : "Never",
  }));

  return (
    <>
      <PageHeader
        eyebrow="Data Directory"
        title="Campaign documents and prospect notes"
        description="Store the documents attached to each campaign, plus the notes and useful information linked to each prospect."
      />
      <DataDirectoryWorkspace 
        initialCampaigns={campaignsData} 
        initialTargets={targetsData} 
        initialDataSources={dataSourcesData} 
      />
    </>
  );
}

function mapCampaignStatus(status: string): CampaignStatus {
  if (status === "ACTIVE") return "Active";
  if (status === "PAUSED") return "Paused";
  if (status === "COMPLETED") return "Completed";
  if (status === "BLOCKED") return "Blocked";
  if (status === "DRAFT") return "Review";
  return "Waiting";
}

function mapTargetStatus(status: string): TargetStatus {
  if (status === "REPLIED") return "Replied";
  if (status === "STOPPED" || status === "NOT_INTERESTED") return "Blocked";
  if (status === "COMPLETED" || status === "INTERESTED") return "Completed";
  if (status === "FOLLOW_UP_DUE" || status === "OVERDUE" || status === "INITIAL_SENT" || status === "FOLLOW_UP_SENT") return "Contacted";
  return "Not contacted";
}

function mapPriority(priority: string): Priority {
  if (priority === "HIGH" || priority === "URGENT") return "High";
  if (priority === "LOW") return "Low";
  return "Medium";
}
